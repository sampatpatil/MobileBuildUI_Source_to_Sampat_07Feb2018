define(['ap/modules/view/widget/basewidget', 'lib/modules/utilities'],
   function (baseWidget, utils) {

       'use strict';

       var translateTexts = function ($target) {
           var AP = this.AP;
           $target.find('*[data-title]')
              .each(function () {

                  var $this = $(this),
                     KeyText = $this.attr('data-title'),
                     Text = KeyText ? AP.View.Internationalize.translate(KeyText) : '';
                  $this
                     .attr('data-title', Text)
                     .html(Text);

              });
           $target.find('*[data-text-key]')
              .each(function () {

                  var $this = $(this);
                  var KeyText = $this.attr('data-text-key');
                  var Text = AP.View.Internationalize.translate(KeyText);



                  if ($this.is("input")) {
                      !$this.attr('title') && $this.attr('title', Text);
                      if (!$this.attr('placeholder')) {
                          $this.attr('placeholder', Text);
                          var kwidget = kendo.widgetInstance($this);
                          if (kwidget) {
                              (!kwidget.options.placeholder) && kwidget.setOptions({ placeholder: Text });
                              kwidget._placeholder && _.isFunction(kwidget._placeholder) && kwidget._placeholder(true);
                          }
                      }

                  }


                  if ($this.is('[type="submit"]')) {
                      $this.val(Text);
                  } else if ($this.is('button')) {
                      var $btnText = $this.find('span.res-text');
                      if ($btnText.length == 0)
                          $btnText = $this.append('<span class="res-text"/>').find('span.res-text');
                      $btnText.html(Text);
                  } else if (!$this.is(':checkbox,:radio'))
                      $this.html(Text);

              });
       };

       var formatters = {
           datetime: function (AP, value, col) {
               return [AP.Utils.parseJsonDateToString(value[col.field])];
           }
       },
        conditionDrivers = {
            'group': function (dataSource, actionFilter, selectedItemsLength) {
                var action = actionFilter.action,
                    minCount = actionFilter.minCount || 1,
                    maxCount = actionFilter.maxCount;

                var filteredData = dataSource.data();

                if (actionFilter.filter) {
                    dataSource.filter(actionFilter.filter);
                    filteredData = dataSource.view();
                }
                var count;
                var groupitems = _.values(_.groupBy(filteredData, actionFilter.fieldName));
                if (groupitems.length == 1) {
                    var count = _.first(groupitems).length;
                    return (count >= minCount && (maxCount && count <= maxCount));
                } else { return false; }

            },
            'and': function (dataSource, actionFilter, selectedItemsLength) {
                var action = actionFilter.action,
                    minCount = actionFilter.minCount || 1,
                    maxCount = actionFilter.maxCount;
                dataSource.filter(actionFilter.filter);
                var count = dataSource.view().length;
                return (count >= minCount && (maxCount && count <= maxCount));
            },
            'all': function (dataSource, actionFilter, selectedItemsLength) {
                var action = actionFilter.action,
                    minCount = actionFilter.minCount || 1,
                    maxCount = actionFilter.maxCount;
                dataSource.filter(actionFilter.filter);
                var count = dataSource.view().length;
                return (count >= minCount && (count == selectedItemsLength));

            },
            'none': function () {
                return true;
            },
            'default': function (dataSource, actionFilter, selectedItemsLength) {
                var action = actionFilter.action,
                    minCount = actionFilter.minCount || 1,
                    maxCount = actionFilter.maxCount;
                dataSource.filter(actionFilter.filter);
                var count = dataSource.view().length;
                return (count >= minCount || (maxCount && count <= maxCount));
            }
        };

       var gridWidget = baseWidget.extend({
           _dataSource: null,
           KendoWidget: null,
           _checkedIds: {},
           _selectAll: false,
           // TODO: This property control the propagation of bubbling events caused by mousdown event of checkbox which trigers unwanted grid change event
           _isCheckBoxClicked: false,
           rawData: null,
           BaseQueryId: '',
           _contentTitleTempl: null,
           _getDefaultConfig: function () {
               var AP = this.AP,
                  Me = this;
               return {
                   theme: '',
                   autoBind: true,
                   releaseQuery: false,
                   customContentScroll: true,
                   customScroll: false,
                   isDepending: false,
                   isSingletonQuery: true,
                   resizable: true,
                   createNewQuery: false,
                   resetQuery: false,
                   doubleTapExpand: true,
                   change: function (e) {
                       Me.change(e);
                   },
                   detailExpand: function (e) {
                       Me.detailExpand(e);
                   },
                   edit: $.proxy(Me._edit, Me),
                   dataBound: function (e) {
                       Me.databound(e)
                   },
                   actionFilters: [],
                   dataSource: {
                       /*requestStart: function (e) { Me.requeststarted(e); },
                             requestEnd: function (e) { Me.requestend(e); },
                             error: function (e) { Me.error(e); },*/
                       pageSize: AP.Config.Data.GridPageSize
                   }
               };
           },
           destroy: function () {
               baseWidget.fn.destroy.apply(this, arguments);
               this.KendoWidget && this.KendoWidget.unbind();
               this.$Block.find('.APWidget').each(function () {
                   var $widget = $(this),
                      widget = $widget.data('APWidget');
                   widget && widget.destroy();
               });
               /*Cleans up query viewmodel created by etending from base queryid with BlockId*/
               if (this._config.releaseQuery) {
                   var queries = this.AP.Model.ViewModel.State.Query;
                   if (queries.hasOwnProperty(this.QueryId)) {
                       queries[this.QueryId].unbind();
                       delete queries[this.QueryId];
                   }
               }

           },
           _getMessageContainerHolder: function () {
               return this.$Block.find('.k-grid-content');
           },
           onInit: function (AP, BlockId) {
               var Me = this;
               var Block = AP.Model.getBlock(BlockId),

                  config = this._config;


               var thRenderTarget = 0;

               if (config.checkable) { // check box in rows

                   config.columns.unshift({
                       attributes: {
                           "class": 'k-checkbox-cell'
                       },
                       template: AP.View.Templates.getTemplate('widget/grid/gridcheckboxcolumn'),
                       width: 30
                   })
               };
               _.each(config.columns, function (col) {
                   if (col.editorType) {
                       col.editor = $.proxy(function ($container, options) {
                           this.context._initializeEditor.call(this.context, this.editorType, this.template, $container, options);
                       }, {
                           context: Me,
                           editorType: col.editorType,
                           template: col.template
                       });
                   }
                   if (col.title && !col.textKey) {
                       col.textKey = col.title;
                       col.title = AP.View.Internationalize.translate(col.textKey);
                   }

                   if (col.formatter) {
                       col.template = _.hook($.proxy(function (data, b) {
                           return formatters[this.col.formatter].call(this, this.AP, data, this.col);
                       }, {
                           col: col,
                           AP: AP
                       }), col.template || function (val) {
                           return val;
                       });
                   }
               });
               if (config.Detail) {
                   thRenderTarget = 1;
                   config.BlockId = BlockId;
                   config.detailInit = $.proxy(this.detailInit, this);
                   //   config.detailExpand = this.detailExpand;
                   config.detailTemplate = AP.View.Templates.getTemplate('widget/grid/griddetail')
               };

               //this._config = $.extend(true, DefaultConfig, config);

               this.Block = Block;
               this.BlockId = BlockId;

               this.BaseQueryId = this.QueryId = this.Block.get('Widget.QueryId');
               if (!this._config.isSingletonQuery)
                   this.QueryId = AP.Config.getExtendedQueryId(this.BlockId, this.BaseQueryId);
               if (this._config.resetQuery)
                   AP.Config.resetQuery(this.QueryId, true);
               else
                   AP.Config.loadQuery(this.QueryId, this._config.createNewQuery);
               this.$Block.attr('data-query-id', this.QueryId);
               this.HasFields = Block.get('Fields') ? 'HasFields' : '';
               this.HasMessageBar = this.Block.get('Widget.Config.messagebar');
               this.HasToolBar = Block.get('Widget.Config.toolbar') ? 'HasToolBar' : '';
               this.HasToolBarTitle = this.Block.get('Widget.Config.toolbartitle') ? 'HasToolBarTitle' : '';
               this.HasDescription = this.Block.get('Widget.Config.headerDescription') ? 'HasDescription' : '';
               this.ToolBarStyle = this.Block.get('Widget.Config.toolbarstyle');
               this.HasToolTip = Block.get('Widget.Config.hasToolTip') ? 'HasToolTip' : '';

               this.$Block.addClass(this.HasFields).addClass(this.HasToolBar);

               this.$Widget = this.$Block
                  .addClass(this.HasFields) // Auto grid layout
               .append(AP.View.Templates.renderTemplate('widget', {}))
                  .find(' > .Widget');
               //var theme = this._config.theme ? this._config.theme + '-theme' : '';
               var theme = this._config.theme || '';
               theme && this.$Widget.addClass(theme);
               /* Toolbar config before widgetize*/
               if (this.HasToolBar != '') {
                   var tmpl = AP.View.Templates.getTemplate('widget/widgettoolbarbutton');
                   for (var ButtonIndex in this._config.toolbar) {
                       var btn = this._config.toolbar[ButtonIndex];
                       btn.AP = AP;
                       btn.queryId && AP.Config.loadQuery(btn.queryId);
                       btn.gridQueryId = this.QueryId;
                       if (btn.externalTemplate) {
                           btn.template = AP.View.Templates.getTemplate(btn.externalTemplate);
                           continue;
                       } else if (!btn.template)
                           btn.template = tmpl;
                   }
               }

               /* Messagebar widget */
               if (this.HasMessageBar) {
                   this.MessageBar = AP.View.Widget.widgetize(this.BlockId, 'APMessageBar');
               };
               /* Datasource setup when autoBind (has QueryId)*/
               if (this.QueryId) {
                   this.setQuery();
               };

               /* Kendo grid */
               this.setupKendoGrid();

               if (this.KendoWidget) { // check 'select all' box in head

                   //setTimeout($.proxy(function () {
                   if (config.checkable) {
                       if (!this.KendoWidget || !this.KendoWidget.tbody) return;
                       // Rows checkbox
                       var $Rows = this.KendoWidget.tbody.find('tr'),
                          $SelectedRows = [];
                       // single or multi rows check  /// Comment Out By Vinayak
                       //var isMultiselect = _.contains(config.selectable.replace(/\s/g, '').split(','), 'multiple');
                       //on click of the checkbox:
                       var count = 0;
                       var selectRow = function (e) {
                           var checked = this.checked,
                              $row = $(this).closest("tr[role=row]"),
                              grid = Me.KendoWidget,
                              tracker = Me._config.checkedStateTrackingMember,
                              item = grid.dataItem($row);
                           if (!checked && _.isBoolean(e) && e) checked = e;
                           Me._checkedIds[item.uid] = checked;
                           if (checked) {
                               //-select the row
                               grid.select($row);
                           } else {
                               //-remove selection
                               $row.removeClass("k-state-selected");
                               Me.change({
                                   sender: Me.KendoWidget
                               });
                           }
                           if (item && tracker)
                               item[tracker] = checked;
                           count++;
                       };
                       // Head checkbox
                       this.KendoWidget.thead
                          .on('click', function () {
                              return true;
                          })
                          .find('th').eq(thRenderTarget)
                       //.append(isMultiselect ? AP.View.Templates.getTemplate('widget/grid/gridcheckboxcolumnhead') : '')
                       .append(AP.View.Templates.getTemplate('widget/grid/gridcheckboxcolumnhead'))
                          .on('change', 'input.selectall', $.proxy(function (e) {
                              var Checked = this._selectAll = $(e.currentTarget).is(':checked');
                              this.KendoWidget.tbody.find('tr')
                                 .find('td input.selectrow')
                                 .each(function () {
                                     if (Checked) this.checked = true;
                                     else {
                                         this.checked = false;
                                         this.removeAttribute('checked');
                                     }
                                     selectRow.call(this, Checked);
                                 });

                              if (!Checked) this.KendoWidget.clearSelection();
                          }, this));

                       this.KendoWidget.table
                        .on("mousedown", "input.selectrow", $.proxy(function (e) {
                            Me._isCheckBoxClicked = true;
                        }))
                       .on("change", "input.selectrow", $.proxy(function (e) {
                           // this.KendoWidget.thead.find('th >.selectall').removeAttr('checked');
                           Me._isCheckBoxClicked = false;
                           selectRow.apply(e.currentTarget, arguments);
                           var checkedrow = this.KendoWidget.tbody.find('tr').find('td input.selectrow').map(function () {
                               if (this.checked == true) return this;
                           });
                           var $headerCheckbox = this.KendoWidget.thead.find('th >.selectall');
                           if (this.KendoWidget.dataSource.view().length != checkedrow.length) {
                               if ($headerCheckbox.prop('checked')) $headerCheckbox.prop('checked', false);
                           } else {
                               $headerCheckbox.prop('checked', true);;
                           }

                       }, this));

                   }
                   this.KendoWidget.table.on('click', '.clickable', $.proxy(function (e) {
                       if (!$(e.currentTarget).is(':disabled')) {
                           e.preventDefault();
                           var $eltInCell = $(e.currentTarget),
                              $row = $eltInCell.parents('tr[data-uid][role=row]'),
                              grid = this.KendoWidget,
                              rowData = grid.dataItem($row);;
                           this.routeEvent('gridcellClick', {
                               BlockId: this.BlockId,
                               e: e,
                               $row: $row,
                               rowData: rowData,
                               CanRepeat: true
                           });
                           return false;
                       }
                   }, this));
                   //}, this), 200);
               };

               if (this.HasToolTip != '') {
                   this.KendoWidget.table.kendoTooltip({
                       filter: "td > .Tooltip",
                       content: function (e) {
                           var target = e.target; // element for which the tooltip is shown
                           return $(target).closest('tr').find('td[tooltipContent]').text();
                       }
                   });
               }
               Me._config.doubleTapExpand && this.$Block.on('dblclick', '.k-master-row', function (e) {
                   var $elt = $(e.currentTarget);
                   if ($elt.find('.k-plus').length)
                       Me.KendoWidget && Me.KendoWidget.expandRow($elt);
                   else Me.KendoWidget && Me.KendoWidget.collapseRow($elt);
               });
               this.$Block.addClass('transform-transition');
               this.$Block.on('pageslide.open', function (e) {
                   var $target = $('#pageslide');
                   translateTexts.call(Me, $target);
                   Me._loadExtToolbarModuleFor($(e.target).parent(), $target, true);
                   //AP.Controller.route('bind', { target: $target });
                   AP.View.refreshScrollables();
                   AP.ActionCenter.hide();
                   //Me.$Block.addClass('zoomout');
               });

               // Translation on toolbars buttons, column heads, messagebar, etc...                 
               this.translateTexts();
           },
           _initializeEditor: function (editorType, template, $container, options) {
               this.routeEvent('initEditor', {
                   editorType: editorType,
                   template: template,
                   $container: $container,
                   options: options
               });
           },
           // -----------------------------------------------------------------------------------
           _restoreSelection: function () {
               if (!this.KendoWidget || !this._config.checkable) return;
               var Me = this,
                  grid = Me.KendoWidget,
                  ds = grid.dataSource,
                  view = ds.view(),
                  tracker = Me._config.checkedStateTrackingMember;
               for (var i = 0; i < view.length; i++) {
                   var $row = grid.tbody.find("tr[data-uid='" + view[i].uid + "']");
                   var item = grid.dataItem($row);
                   if (Me._checkedIds[view[i].uid] || item && item[tracker]) {
                       $row.addClass("k-state-selected")
                          .find("input.selectrow")
                          .attr("checked", "checked");
                       Me._checkedIds[view[i].uid] = true;
                   }
                   if (item && tracker)
                       item[tracker] = Me._checkedIds[view[i].uid] == true;
               }
           },

           _restoreHeaderCheckbox: function () {
               if (!this.KendoWidget || !this._config.checkable) return;
               var Me = this,
                  grid = Me.KendoWidget,
                  ds = grid.dataSource,
                  view = ds.view();

               var checkedrow = this.KendoWidget.tbody.find('tr').find('td input.selectrow').map(function () {
                   if (this.checked == true) return this;
               });
               var $headerCheckbox = this.KendoWidget.thead.find('th >.selectall');
               if (this.KendoWidget.dataSource.view().length > 0) {
                   $headerCheckbox.prop('disabled', false);
                   (this.KendoWidget.dataSource.view().length === checkedrow.length) ? $headerCheckbox.prop('checked', true) : $headerCheckbox.prop('checked', false);
               } else {
                   $headerCheckbox.prop('checked', false);
                   $headerCheckbox.prop('disabled', true);
               }

           },
           onDataSourceReady: function (e, r) {
               if (!this._config.isDepending || !this.KendoWidget) return;
               //var data = this._dataSource.options.schema.parse((e || r).response);
               //this.Query && (this.Query.DataSource.data = data);
               //this.refreshDataSource(false, data);
               this.KendoWidget.dataSource.transport = {
                   read: function (args) {
                       args.success(args.data.response);
                   }
               };
               this.KendoWidget.dataSource.read(e || r);
           },
           notifyDependables: function (data, response) {
               var AP = this.AP,
                  block = AP.Model.getBlock(this.BlockId),
                  queries = block.get('Widget.Dependables.Queries');
               if (!queries) return;
               var d = data,
                  r = response;
               _.each(queries, function (q) {
                   _.each(AP.View.$ViewRoot.find('.APWidget[data-query-id="' + q + '"]'), function (elt) {
                       var $elt = $(elt),
                          widget = $elt.data('APWidget');
                       if (widget && widget.onDataSourceReady) widget.onDataSourceReady(d, r);
                   });
               });
           },
           getAllRows: function () {
               return this.KendoWidget.tbody.find("tr[data-uid][role=row]");
           },
           getRow: function (uid) {
               return this.KendoWidget.tbody.find("tr[data-uid='" + uid + "'][role=row]");
           },
           setQuery: function (ExtraData) {

               var AP = this.AP,
                  AppQuery = AP.Config.getQuery(this.BaseQueryId),
                  SavedQuery = AP.Config.loadQuery(this.QueryId), // All queries are saved in ModelView State
                  SavedQuery = SavedQuery ? SavedQuery.toJSON() : {};

               this.Query = $.extend(true, {}, AppQuery, SavedQuery, ExtraData);
               AP.Model.ViewModel.set('State.Query.' + this.QueryId, this.Query); // Actualize saved query				
           },
           /*Deprecated. Please don't use this method*/
           fetch: function (Args) {

               // Grid reconstruction with a new query
               this.QueryId = Args.QueryId;
               this.setQuery(Args.QueryData);
               this.setupKendoGrid();
               // this.KendoWidget.dataSource.read();
           },
           refreshWidget: function () {
               this.KendoWidget && this.KendoWidget.refresh();
           },
           _updateQueryObj: function () {
               var SavedQuery = this.AP.Config.loadQuery(this.QueryId); // All queries are saved in ModelView State
               return this.Query = SavedQuery ? SavedQuery.toJSON() : {};
           },
           refresh: function () {

               var AP = this, Query = this._updateQueryObj(),
                  QueryData = Query.Form, // Data for render form 
                  QueryDataForDataSource = Query.QueryJsonData == null ? this.AP.Model.DataSource.adaptQueryDataForDataSource(QueryData) : Query.QueryJsonData;

               this.Query = Query;
               this.KendoWidget.dataSource.read(QueryDataForDataSource);
               this.change();
               //this.KendoWidget && this.KendoWidget.refresh();
               this.$Block.hasClass('InTabStrip') && this.isInTabStrip();

           },

           // -----------------------------------------------------------------------------------

           clear: function () {

               if (this.KendoWidget) {
                   this.KendoWidget.destroy();
               };
               this.$Widget.empty();
               this.$Widget.kendoGrid({});
               this.KendoWidget = this.$Widget.data('kendoGrid');
               this.resizeScroll();
           },
           _bindDataSrcEvents: function () {
               var Me = this;
               Me.KendoWidget.dataSource.bind('requestStart', $.proxy(Me.requeststarted, Me));
               //Me.KendoWidget.dataSource.bind('progress', $.proxy(Me.requeststarted, Me));
               Me.KendoWidget.dataSource.bind('requestEnd', $.proxy(Me.requestend, Me));
               Me.KendoWidget.dataSource.bind('error', $.proxy(Me.error, Me));

           },

           //----------------------------------------------------------------------------
           refreshDataSource: function (skipRead, data) {
               var AP = this.AP;
               this.setQuery();
               var CompoundDataSource = this.AP.Model.DataSource.getDataSource(this.Query),
                  QueryData = CompoundDataSource.QueryData,
                  DataSource = CompoundDataSource.DataSource;
               if (this.KendoWidget) {
                   //this.KendoWidget.dataSource.data([]);
                   var options = this._formatDataSource(DataSource, data);
                   options.pageSize = AP.Config.Data.GridPageSize;
                   var ds = new kendo.data.DataSource(options);

                   this.KendoWidget.setDataSource(ds);
                   this._bindDataSrcEvents();
                   if (options.data) {
                       ds.data(options.data);
                       this.KendoWidget.refresh();
                   }
                   this.change();
                   if (skipRead === true) return;
                   this.doRead(data);
               }

           },

           //----------------------------------------------------------------------------
           doRead: function (data) {
               if (this._config.autoBind === false && this.KendoWidget && this.KendoWidget.dataSource)
                   this.KendoWidget.dataSource.read(data);
           },
           _formatDataSource: function (ds, data) {
               if (this._config.isDepending)
                   ds.transport = {
                       read: {
                           data: data
                       }
                   };
               if (this._config.handleError && ds.error)
                   delete ds.error;
               return ds;
           },
           // -----------------------------------------------------------------------------------

           setupKendoGrid: function () {

               var Me = this,
                  AP = Me.AP,
                  Config = {};

               if (this.Query) {

                   var CompoundDataSource = AP.Model.DataSource.getDataSource(Me.Query),
                      QueryData = CompoundDataSource.QueryData,
                      DataSource = CompoundDataSource.DataSource,
                      QueryDataForTitle = AP.Model.DataSource.adaptQueryDataForDataSource(Me.Query.Form);

                   /* Set Grid Title */
                   var title = QueryDataForTitle.APTitle || Me.Query.Title || '';
                   if (title) {

                       AP.Utils.setBlockTitle(Me.$Block, title);
                       Me.HasFields = 'HasFields';
                       Me.$Block.addClass(Me.HasFields)
                   } else {
                       Me.HasFields = null;
                       Me.$Block.removeClass(Me.HasFields)
                   }
                   DataSource.pageSize = AP.Config.Data.GridPageSize;
                   $.extend(true, Config, Me._config, this._config.autoBind && {
                       dataSource: Me._formatDataSource(DataSource)
                   });
               }

               if (Me.KendoWidget) {
                   Me.KendoWidget.destroy();
               };



               Me.$Widget.empty();

               //TODO: makes messages overridable from dna file
               var messages = AP.View.Internationalize.getMessageTree('widgets:' + Me.Block.Widget.Type + '.widget');
               if (Config.pageable) {
                   _.isObject(Config.pageable) ? Config.pageable.messages = messages.pageable.messages : Config.pageable = messages.pageable
               }
               if (Config.groupable) {
                   _.isObject(Config.groupable) ? Config.groupable.messages = messages.groupable.messages : Config.groupable = messages.groupable
               }
               Me.$Widget.kendoGrid(Config);
               Me.resizeScroll();
               Me.KendoWidget = Me.$Widget.data('kendoGrid');
               Me._dataSource = Me.KendoWidget.dataSource;
               // Headeers response
               Me.$Block.find('th.k-header')
                  .on('click', function () {
                      Me.change();
                  });
               Me.KendoWidget.tbody.on('click', 'a[data-command]', $.proxy(Me._executeCommand, Me));
               Me._setupDraggables();
               Me._setupDropTarget();

               this._bindDataSrcEvents();
               if (Me.HasDescription != '') {
                   Me._setGridDescription(Config);
               }


               /* toolbar setup */
               if (Me.HasToolBar != '') {
                   Me.setupToolBar(Config);
               };
               this._contentTitleTempl = Config.gridContentTitleTemplate ? kendo.template(Config.gridContentTitleTemplate) : null;
               Me._setGridContentTitle();
               /* Texts */
               Me.translateTexts();

               /*setup custom scroll*/
               this.$Block.find(' > .Widget .k-grid-content').addClass('custom-scrollable');
           },
           _setGridDescription: function (Config) {
               var Me = this, AP = this.AP, $toolbar = Me.$toolbar = this.$Block.find(' > .Widget .k-grid-toolbar');
               this.$Block.find(' > .Widget').addClass('overideMarginTop');
               $('<div class="gridDescription k-header-description"></div>').insertAfter($toolbar);
               var $gridDesc = this.$Block.find(' > .Widget .k-header-description');
               var title = AP.View.Internationalize.translate(Config.headerDescription.title || '');
               $gridDesc.html(title);

           },
           _setGridContentTitle: function () {
               if (this._contentTitleTempl) {
                   var title = this._contentTitleTempl(this);
                   var $title = this.$Block.find('.grid-content-title');
                   if (!$title.length) $title = $('<div class="grid-content-title"></div>').insertBefore(this.$Block.find('.k-grid-header')).find('.grid-content-title');
                   $title.html(title);
               }
           },
           setMaxItems: function (maxItems) {
               this._config.maxItems = maxItems;
           },
           _validateRow: function (command, data) {
               var valid = true,
                  rule, validations = this._config.rowValidations;
               validations = validations && validations[command];
               if (!validations) return {
                   valid: valid
               };
               var fields = validations.fields;
               _.each(fields, function (v, k) {
                   if (valid)
                       switch (v.rule) {
                           case 'required':
                               if (data.hasOwnProperty(k))
                                   valid = (data.get(k) || '').length > 0;
                               if (!valid) rule = v;
                               break;
                       }

               });
               return {
                   valid: valid,
                   rule: rule
               };
           },
           _executeCommand: function (e) {
               e.preventDefault();
               var $btn = $(e.currentTarget),
                  command = $btn.attr('data-command');
               if (!this.KendoWidget) return;
               var $row = $btn.parents('tr[data-uid][role=row]'),
                  data = this.getDataItem($row),
                  statusTracker = this._config.statusTracker;
               if (!data) return;
               var args = {
                   command: command,
                   rowData: data,
                   handled: false,
                   preventRefresh: false
               };
               this.routeEvent('command', args);
               if (!args.handled) {
                   var vresult = this._validateRow(command, data);
                   if (vresult.valid) {
                       switch (command) {
                           case 'add':

                               if (this.KendoWidget._data.length < this._config.maxItems) {
                                   this.KendoWidget.addRow();
                               }
                               this._config.statusTracker && data.set(statusTracker, false);
                               break;
                           case 'destroy':
                               var addNew = _.filter(this.KendoWidget._data, function (d) {
                                   return d.IsNew != true;
                               }).length == this._config.maxItems;
                               this.KendoWidget.removeRow($btn.parents('tr[data-uid][role=row]'));
                               if (addNew) {
                                   (this.KendoWidget._data.length < this._config.maxItems) && (this.KendoWidget.addRow());
                               }
                               break;
                       }
                   } else if (vresult.rule && vresult.rule.message) {
                       this.AP.View.showAlertKey(vresult.rule.message);
                       try {
                           this._editRow(data.uid);
                       } catch (e) { }
                   }

               } !args.preventRefresh && this._config.refreshAfterCommand && this.KendoWidget.refresh();
           },
           showExToolbar: function () {
               this.$Block.find('.ExtendedToolbar').css('display', 'inline-block');
               this.resizeScroll();
           },
           hideExToolbar: function () {
               this.$Block.find('.ExtendedToolbar').hide();
               this.resizeScroll();
           },
           onVisibilityChanged: function (visible) {
               visible && this.resizeScroll();
           },
           onWindowResize: function () {
               this.resizeScroll();
           },
           onKendoWindowActivated: function () {
               this.resizeScroll();
           },
           onPageInteracted: function () {
               this.resizeScroll();
           },
           onAfterMainMenuStateChanged: function () {
               this.resizeScroll();
           },
           _getScrollConfig: function (sel) {
               var obj = (this._config.customScrollConfigs && this._config.customScrollConfigs.hasOwnProperty(sel) && this._config.customScrollConfigs[sel]);
               return $.extend(true, {}, {
                   railoffset: true
               }, obj);
           },
           resizeScroll: function () {
               this.$Block.find(' > .Widget .k-grid-content').css('height', 'calc(100% - 140px)');
               this._config.customContentScroll && baseWidget.fn.resizeScroll.call(this, '.k-grid-content');
               //this._config.customScroll && baseWidget.fn.resizeScroll.call(this);
           },
           routeEvent: function () {
               baseWidget.fn.routeEvent.apply(this, arguments);
               this.resizeScroll();
           },
           button: function (Action, Active) {

               var $Button = this.$Block.find('.k-grid-toolbar,.ExtendedToolbar').find('[data-action="' + Action + '"]');
               if (Active) {
                   $Button
                      .removeClass('k-state-disabled')
                      .removeAttr('disabled');
               } else {
                   $Button
                      .addClass('k-state-disabled')
                      .attr('disabled', 'true');
               }
           },
           // -----------------------------------------------------------------------------------
           getSelectedRows: function () {
               try {
                   return this.KendoWidget.select();
               } catch (e) {
                   return $([]);
               }
           },
           getSelectedItems: function () {
               var me = this,
                  $rows = me.getSelectedRows(),
                  selectedItems = [];
               $rows.each(function () {
                   var $row = $(this),
                      dataItem = me.KendoWidget.dataItem($row);
                   selectedItems.push(dataItem);
               });
               return selectedItems;
           },
           setData: function (data) {
               this.KendoWidget && this.KendoWidget.dataSource.data(data || []);
           },
           getCount: function () {
               var data = this.getData();
               return data && data.length ? data.length : 0;
           },
           getData: function () {
               return this.KendoWidget && this.KendoWidget.dataSource.data();
           },
           addRow: function (data) {
               this.KendoWidget && this.KendoWidget.dataSource.insert(data);
           },
           removeRow: function (data) {
               this.KendoWidget && this.KendoWidget.dataSource.remove(data);
           },
           removeRows: function (items) {
               var me = this;
               _.each(items, function (item) {
                   me.removeRow(item);
               });
           },
           setPage: function (page) {
               this.KendoWidget && this.KendoWidget.dataSource.page(page);
           },
           getTotalPages: function () {
               this.KendoWidget && this.KendoWidget.dataSource.totalPages();
           },
           _edit: function (e) {
               this.routeEvent('edit', {
                   e: e,
                   BlockId: this.BlockId
               });
           },
           _evaluateActionFilters: function () {
               var me = this, actionFilters = me._config.actionFilters;
               var selectedItemsLength = me.getSelectedItems().length;
               var dataSource = new kendo.data.DataSource({ data: me.getSelectedItems() }),
                   showButtonsList = [], hideBtnsList = [];

               _.each(actionFilters, function (actionFilter) {
                   var action = actionFilter.action;
                   var result = selectedItemsLength >= (actionFilter.minLength || 1);
                   if (actionFilter.maxLength) {
                       result = result && (selectedItemsLength <= actionFilter.maxLength);
                   }

                   if (result) {
                       result = conditionDrivers[actionFilter.condition || 'default'](dataSource, actionFilter, selectedItemsLength);
                   }
                   result ? showButtonsList.push(action) : hideBtnsList.push(action);
               });

               me.activateButtons(showButtonsList);
               me.showButtons(showButtonsList);

               me.disableButtons(hideBtnsList);
               me.hideButtons(hideBtnsList);

           },
           change: function (e) {
               if (!this._config.selectable || this._isCheckBoxClicked == true) { return; }

               var me = this,
                  $rows = me.getSelectedRows(),
                  selectedItems = [];

               if (this._config.checkable) {
                   var $headerCheckbox = me.KendoWidget.thead.find('th >.selectall');
                   me.KendoWidget.tbody.find('tr').not($rows)
                      .find('td input.selectrow')
                      .each(function () {
                          if (this.checked) {
                              if ($headerCheckbox.prop('checked')) $headerCheckbox.prop('checked', false);
                              this.checked = false;
                              this.removeAttribute('checked');
                          }

                      });

               }
               $rows.each(function () {
                   var $row = $(this),
                      grid = me.KendoWidget,
                      dataItem = grid.dataItem($row);
                   $row.find('input.selectrow').prop('checked', true);
                   me._checkedIds[dataItem.id] = true;
                   selectedItems.push(dataItem);

               });


               this.routeEvent('change', {
                   BlockId: this.BlockId,
                   e: e,
                   selectedItems: selectedItems,
                   selectedItem: this.KendoWidget.dataItem(this.getSelectedRows()),
                   CanRepeat: true
               });
               me._evaluateActionFilters();
           },
           _editRow: function (uid) {
               var $row = this.getRow(uid);
               this.KendoWidget && $row && !$row.is('.k-grid-edit-row') && this.KendoWidget.editRow($row);
           },
           _draggableOnDragStart: function (e) {

           },
           _draggableOnDragEnd: function (e) {

           },
           _droppableOnEnter: function (e) {

           },
           _droppableOnLeave: function (e) {

           },
           _droppableOndrop: function (e) {

           },
           _setupDropTarget: function () {
               if (!this.KendoWidget) return;
               var me = this;
               this._config.dropTarget && this.KendoWidget.element.kendoDropTarget({
                   drop: function (e) {
                       //debugger;
                       me._droppableOndrop(e);
                   },
                   dragenter: function (e) {
                       me._droppableOnEnter(e);
                   },
                   dragleave: function (e) {
                       me._droppableOnLeave(e);
                   }
               });
           },
           _setupDraggables: function () {
               if (!this.KendoWidget) return;
               var me = this;
               this._config.dragEnabled && me.KendoWidget.table.kendoDraggable({
                   filter: "tbody > tr",
                   threshold: 100,
                   hint: function (e) {
                       return $('<div style="width:30%;" class="k-grid k-widget"><table><tbody><tr>' + e.html() + '</tr></tbody></table></div>');
                   },
                   dragstart: function (e) {
                       this.model = me.getDataItem($(e.currentTarget));
                       this.widget = me;
                       me._draggableOnDragStart(e);
                   },
                   dragend: function (e) {
                       this.model = null;
                       me._draggableOnDragEnd(e);
                   }
               });

           },
           databound: function (e) {
               this._restoreSelection();
               this._restoreHeaderCheckbox();
               this._setGridContentTitle();
               this.resizeScroll();

               var $rows = this.getSelectedRows();
               this.KendoWidget && this.routeEvent('databound', {
                   BlockId: this.BlockId,
                   e: e,
                   selectedItem: $rows.length && this.KendoWidget.dataItem($rows),
                   CanRepeat: true
               });

               //this._initEditOnDataBound();
               this._evaluateActionFilters();
           },

           error: function (e) {

               if (this.HasMessageBar && e.errors) {
                   this.MessageBar.displayErrors(e.errors);
               };

               this.routeEvent('error', {
                   BlockId: this.BlockId,
                   e: e,
                   CanRepeat: true
               });
           },
           requeststarted: function (e) {
               // this.Query.DataSource.schema.parse(e.response, AP);
               this._requestStarted = this._requestOnceStarted = true;
           },
           requestend: function (e) {
               // this.Query.DataSource.schema.parse(e.response, AP);
               this.rawData = e;
               try {
                   if (this.HasMessageBar && e.response) {
                       this.MessageBar.displayMessage(this.Query.Message);
                   } else {
                       this.Query.Message.Key = 'api:query.norecords';
                       //this.MessageBar.displayMessage(this.Query.Message);
                   }
               } catch (e) {

               }
               //if only the source of request end event is read notify depedendables
               (e.type == 'read') && this.notifyDependables(e, e);
           },

           // -----------------------------------------------------------------------------------

           setDeletingQueue: function (DeletingQueue) {

               this.DeletingQueue = [];
               for (var RowIndex = 0; RowIndex < DeletingQueue.length; RowIndex++) {

                   var Row = DeletingQueue[RowIndex];
                   this.DeletingQueue.push({
                       Row: Row,
                       Processed: false,
                       Success: false
                   });
               };
           },

           deleting: function (Args) {

               var Row = Args.Row,
                  Success = Args.Success,
                  AllProcessed = true,
                  AllSuccess = true;

               for (var ItemIndex = 0; ItemIndex < this.DeletingQueue.length; ItemIndex++) {

                   var Item = this.DeletingQueue[ItemIndex];

                   if (Item.Row == Row) {

                       this.DeletingQueue[ItemIndex].Success = Success;
                       this.DeletingQueue[ItemIndex].Processed = true;

                       if (Success) { // remove row
                           this.KendoWidget.removeRow(Row);
                       } else {
                           AllSuccess = false;
                       }
                   };

                   if (!this.DeletingQueue[ItemIndex].Processed) {
                       AllProcessed = false;
                   };
               };

               if (AllProcessed) {
                   this.routeEvent('finishdeleting', {
                       BlockId: this.BlockId,
                       AllSuccess: AllSuccess
                   });
               }
           },

           // -----------------------------------------------------------------------------------

           isInTabStrip: function () {
               var AP = this.AP,
                  NewTitle = '',
                  addIndex = false;
               if (this._updateQueryObj() && !NewTitle) {
                   var QueryData = this.Query.Form, // Data for render form 
                      QueryDataForDataSource = AP.Model.DataSource.adaptQueryDataForDataSource(QueryData);
                   NewTitle = QueryDataForDataSource.APTitle || this.Query.Title || '';
               }
               if (!NewTitle && this._config.title) {
                   NewTitle = AP.View.Internationalize.translate(this._config.title);
                   addIndex = true;
               }
               NewTitle && this.changeTabTitle(NewTitle, addIndex);
           },
           _getCurrentTitle: function () {
               return this._lastTitle;
           },
           // ---------------------------------.0-------------------------------------------------- 
           changeTabTitle: function (NewTitle, addIndex) {

               var InTabIndex = parseInt(this.$Block.attr('data-in-tab-index')),
                  $ParentTabStripTab = this.$Block.parents('.APReorderableTabStrip').eq(0)
                  .find('> .Blocks > .TabBar li').eq(InTabIndex),
                  $Title = $ParentTabStripTab.find('.Title').not('.inplace-editor'),
                  $editor = $ParentTabStripTab.find('.Title.inplace-editor');

               var current = $Title.html();

               //if (!force && current && current != NewTitle && $Title.is('[data-role="inplaceeditor"]')) return;
               if (NewTitle) {
                   if (addIndex) NewTitle = !$editor.data('titleset') ? ([NewTitle, ' ', this.$Block.index()].join('')) : NewTitle;
                   else
                       this.$Block.attr('data-title-edited', true);
                   this._lastTitle = NewTitle;
                   $editor.data('titleset', NewTitle);
                   $Title.html(NewTitle);
                   $editor.val(NewTitle);
               }


           },

           // -----------------------------------------------------------------------------------

           setupToolBar: function (config) {

               var ToolBarStyle = this.Block.get('Widget.Config.toolbarstyle'),
                  Me = this,
                  AP = Me.AP;

               switch (ToolBarStyle) {

                   case 'menu':

                       var MenuTitleKey = this.Block.get('Widget.Config.toolbartitle') || 'widgets:APGrid.toolbar.menu.title',
                          MenuTitleHTML = AP.View.Templates.renderTemplate('widget/toolbar/toolbarmenutitle', {
                              TitleKey: MenuTitleKey
                          }),
                          $MenuContainer = this.$Block.find(' > .Widget .k-grid-toolbar');

                       // Kendo menu struct	
                       $MenuContainer
                          .find('a')
                          .wrapAll('<ul></ul>')
                          .wrapAll('<li></li>')
                          .wrapAll('<ul></ul>')
                          .wrap('<li></li>');

                       // Add title & kendo menu
                       $MenuContainer
                          .find('> ul > li')
                          .prepend(MenuTitleHTML)
                          .parent()
                          .kendoMenu({
                              direction: 'left',
                              animation: false,
                              select: $.proxy(function (e) {

                                  var e = $(e.item).find('a')[0],
                                     $e = $(e),
                                     Active = $e.attr('disabled') != 'disabled',
                                     KeyTitle = $e.find('.k-toolbar-button-text')
                                     .attr('data-text-key'),
                                     Title = AP.View.Internationalize.translate(KeyTitle);

                                  if (Active) {
                                      this.routeEvent('toolbar', {
                                          BlockId: Me.BlockId,
                                          e: e,
                                          Title: Title,
                                          CanRepeat: true
                                      });
                                  };
                                  return false;
                              }, this)
                          });

                       break;

                   default: // A tags in a list           
                       if (this.HasToolBarTitle != '') {
                           var MenuTitleKey = this.Block.get('Widget.Config.toolbartitle'),
                              MenuTitleHTML = AP.View.Templates.renderTemplate('widget/toolbar/toolbarmenutitle', {
                                  TitleKey: MenuTitleKey,
                                  QueryId: this.Block.get('Widget.QueryId')
                              }),
                              $MenuContainer = this.$Block.find(' > .Widget .k-grid-toolbar');
                           $MenuContainer.prepend(MenuTitleHTML);
                       }

                       this.$Block.find(' > .Widget .k-grid-toolbar input[type=text]').on('keyup', $.proxy(function (e) {
                           var $this = $(this),
                              Active = $this.attr('disabled') != 'disabled';
                           if (Active && e.keyCode == 13) {
                               e.preventDefault();
                               this.routeEvent('toolbar', {
                                   BlockId: this.BlockId,
                                   e: e,
                                   Key: 'enter',
                                   IsKeyEvent: true,
                                   CanRepeat: true
                               });
                           }
                           return false;
                       }, this));

                       var clickHandler = this._clickHandler = $.proxy(function (e) {
                           e.preventDefault();
                           $.pageslide.close();
                           var $this = $(e.currentTarget),
                              $e = $this.find('.k-toolbar-button-text'),
                              Active = $this.attr('disabled') != 'disabled',
                              KeyTitle = $e.attr('data-text-key'),
                              Title = KeyTitle ? AP.View.Internationalize.translate(KeyTitle) : '';

                           if (Active) {

                               this.routeEvent('toolbar', {
                                   BlockId: Me.BlockId,
                                   e: e,
                                   Title: Title,
                                   CanRepeat: true
                               });
                           };
                           this.resizeScroll();
                           return false;
                       }, this);
                       var $toolbar = Me.$toolbar = this.$Block.find(' > .Widget .k-grid-toolbar');
                       var $extendedToolbar = Me.$extendedToolbar = this.$Block.find(' > .Widget .ExtendedToolbar');
                       if ($extendedToolbar.length == 0)
                           $extendedToolbar = Me.$extendedToolbar = $('<div class="ExtendedToolbar"></div>').insertAfter($toolbar);
                       $extendedToolbar.html('');
                       this._loadExtToolbarModules();
                       var $widget = this.$Block.find(' > .Widget');
                       $widget.find('.k-grid-toolbar a,.ExtendedToolbar a').not('[data-skip-click=true]')
                          .on('click', this._clickHandler);
                       $('#pageslide').find('.k-grid-toolbar a,.ExtendedToolbar a').not('[data-skip-click=true]')
                          .on('click', this._clickHandler);
                       this._config.activateButtons && this.activateButtons(this._config.activateButtons);
                       break;
               }
           },
           _loadExtToolbarModuleFor: function ($elt, context, force) {
               var Me = this,
                  AP = Me.AP,
                  config = this._config,
                  $extendedToolbar = Me.$extendedToolbar;
               var $mb, id = $elt.data('custom-module-id');
               _.each(config.toolbar, function (btn) {
                   if (btn.customModule && (force || !btn.extended) && btn.customModule.id == id) {
                       if (config.extendedToolbarModules) {
                           var ext = btn.extended = _.findWhere(config.extendedToolbarModules, {
                               id: btn.customModule.id
                           });
                           if (ext) {
                               if (context)
                                   $mb = $(ext.selector, context);
                               else
                                   $mb = $extendedToolbar.find(ext.selector);
                           }
                       }
                       var moduleLoader = $.proxy(function (module) {
                           this.btn.module = new module(this.config);
                       }, {
                           btn: btn,
                           config: {
                               AP: AP,
                               BlockId: Me.BlockId,
                               module: btn.extended || btn.customModule,
                               $mb: $mb,
                               eventHandlers: {
                                   click: Me._clickHandler
                               }
                           }
                       });
                       require([btn.customModule.path || btn.extended.path], moduleLoader);
                   }
               });

           },
           _loadExtToolbarModules: function () {
               var Me = this,
                  AP = Me.AP,
                  config = this._config,
                  $toolbar = Me.$toolbar;
               _.each(config.extendedToolbarModules || [], function (ext) {
                   var tmpl = kendo.template(ext.template || AP.View.Templates.getTemplate(ext.externalTemplate));
                   var attr = kendo.format('data-extended-module-for="{0}"', ext.id);
                   ext.selector = '[' + attr + ']';
                   $($.trim(tmpl({
                       AP: AP,
                       module: ext,
                       gridQueryId: Me.QueryId
                   })))
                      .wrap('<div class="CustomModule"' + attr + '></div>')
                      .parents(ext.selector)
                      .appendTo(Me.$extendedToolbar);
               });
               $toolbar.find('[data-custom-module-id]').each(function () {
                   Me._loadExtToolbarModuleFor($(this));
               });
           },

           showMenu: function () {
               if (this.HasToolBar != '' && this.ToolBarStyle == 'menu') {
                   this.$Widget.find('.k-toolbar .k-menu').show();
               };
           },

           hideMenu: function () {
               if (this.HasToolBar != '' && this.ToolBarStyle == 'menu') {
                   this.$Widget.find('.k-toolbar .k-menu').hide();
               };
           },
           getDataItem: function ($row) {
               return this.KendoWidget ? this.KendoWidget.dataItem($row) : null;
           },
           getByUid: function (uid) {
               return this.KendoWidget && this.KendoWidget.dataSource.getByUid(uid);
           },
           hasData: function () {
               var data = this.getData();
               return data != null && data.length > 0;
           },
           applyGrouping: function (config) {
               config && this.KendoWidget && this.KendoWidget.dataSource && this.KendoWidget.dataSource.group(config);
           },
           applyFilter: function (filter) {
               this.KendoWidget && this.KendoWidget.dataSource && this.KendoWidget.dataSource.filter(filter || {});
           },
           // -----------------------------------------------------------------------------------

           translateTexts: function () {

               baseWidget.fn.translateTexts.call(this);

               /*this.$Block.find('*[data-title]')
                   .each(function () {
   
                       var $this = $(this),
                           KeyText = $this.attr('data-title'),
                           Text = KeyText ? AP.View.Internationalize.translate(KeyText) : '';
   
                       $this
                      .attr('data-title', Text)
                      .html(Text);
                   });*/
           },

           // -----------------------------------------------------------------------------------        
           detailInit: function (Args) {

               var Me = this,
                  AP = Me.AP,
                  DetailUID = Args.data.uid,
                  $DetailUID = $('#' + DetailUID),
                  Detail = _.extend({},
                     this._config.Detail, {
                         BlockId: DetailUID,
                         GridBlockId: this.BlockId,
                         Data: Args.data
                     });

               $DetailUID.data('APWidget',
                  AP.View.Widget.widgetize(DetailUID,
                     'APGridDetail',
                     Detail));

               var $widget = AP.View.getBlock(this.BlockId),
                  widget = $widget.data('APWidget');

               widget.routeEvent('detailInit', {
                   BlockId: this.BlockId,
                   DetailBlockId: DetailUID,
                   Data: Args.data,
                   Detail: Detail
               });
               this._restoreScrollTop();
           },
           _refreshDetailNext: function (args) {
               var $detail = $('#' + args.uid);
               if ($detail.length == 0) {
                   this.KendoWidget && this.KendoWidget.expandRow($('[data-uid=' + args.uid + ']'));
                   return;
               }

               var widget = $detail.data('APWidget');
               widget && widget.destroy();
               $detail.data('APWidget', null).empty();

               //this.AP.Model.removeBlock(args.uid);
               this.detailInit(args);
           },
           _restoreScrollTop: function () {
               this._scrollTop != null && utils.invokeAsync(function () {
                   this.KendoWidget && this.KendoWidget.content.scrollTop(this._scrollTop);
                   this._scrollTop = null;
               }, this, null, 200);
           },
           refreshDetail: function (uid, callback) {
               var sel = '#' + uid;
               if ($(sel).length == 0) return;
               var grid = this.KendoWidget;
               this._scrollTop = grid.content.scrollTop();
               kendo.ui.progress($(sel), true);
               var args = {
                   uid: uid,
                   widget: this,
                   data: this.getByUid(uid),
                   error: function () {
                       kendo.ui.progress($(sel), false);
                   },
                   next: $.proxy(function (args) {
                       kendo.ui.progress($(sel), false);
                       this.widget._refreshDetailNext(this);
                       callback && callback.apply(this, args);
                       //this.widget._restoreScrollTop();
                   }, args)
               };
               this.routeEvent('refreshDetail', args);
           },
           detailExpand: function (e) {

               var me = this,
                  grid = me.KendoWidget;

               this.routeEvent('detailExpand', {
                   BlockId: this.BlockId,
                   e: e,
                   selectedItem: grid.dataItem(e.masterRow),
                   CanRepeat: true
               });
           }
       });

       return {
           name: 'Grid',
           widget: gridWidget
       };
   }
)