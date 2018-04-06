
define(

    [
        'kendo',// Kendo Libs
        'ap/modules/view/widget/basewidget',
        'lib/modules/utilities',
    ],

    function (K, baseWidget, utils) {

        'use strict';
        var exWidget = baseWidget.extend({
            _getDefaultConfig: function () {
                var Me = this, AP = this.AP;
                return {
                    customScroll: true,
                    dropTarget: false,
                    dragEnabled: false,
                    isDepending: false,
                    uniqueIdField: 'uid',
                    navigatable: false,
                    dragEnterClass: 'drag-hover',
                    statusTracker: '',
                    animateItems: false,
                    change: function (e) {
                        Me.change(e);
                    },
                    dataBound: function (e) { Me.databound(e) },
                    dataSource: {
                        requestEnd: function (e) { Me.requestend(e); },
                        error: function (e) { Me.error(e); },
                        //pageSize: AP.Config.Data.GridPageSize
                    }
                };
            },
            onInit: function (AP, BlockId) {
                var Me = this;

                this._config.template = AP.View.Templates.getTemplate(this._config.template);

                this.BlockId = BlockId;
                var Block = this.Block = AP.Model.getBlock(BlockId);
                this.QueryId = Block.get('Widget.QueryId') || '';

                this.$Block.attr('data-query-id', this.QueryId);


                this.HasMessageBar = this.Block.get('Widget.Config.messagebar');

                this.$Block.addClass(this.HasFields);

                this.$Widget = this.$Block
                                   .addClass(this.HasFields) // Auto grid layout
                                   .append(AP.View.Templates.renderTemplate('widget', {}))
                                   .find(' > .Widget');


                /* Messagebar widget */
                if (this.HasMessageBar) { this.MessageBar = AP.View.Widget.widgetize(this.BlockId, 'APMessageBar'); };

                /* Datasource setup when autoBind (has QueryId)*/
                if (this.QueryId) { this.setQuery(); };
                this._setupDropTarget();

                /* Kendo List view */
                this.setup();
                this._refreshHandler();
            },
            _refreshHandler: function () {
                var Me = this;
                if (this.KendoWidget) {
                    this.KendoWidget.element.on('click', 'input[type=checkbox].selectitem', function (e) {
                        var checked = this.checked, $elt = $(this), $item = $elt.closest('[role=option]');
                        var item = Me.KendoWidget._modelFromElement($item);
                        if (item && Me._config.checkable && Me._config.checkedStateTrackingMember && item.hasOwnProperty(Me._config.checkedStateTrackingMember)) {
                            item[Me._config.checkedStateTrackingMember] = checked;
                            Me.change(e, item);
                        }
                    });
                }
            },
            unSelectNode: function () {
                if (!this.KendoWidget) return;
                this.KendoWidget.select().find("span.k-state-selected").removeClass("k-state-selected");
            },
            dataItem: function ($elt) {
                if (!this.KendoWidget) return null;
                return this.KendoWidget._modelFromElement($elt);
            },
            getDataItems: function () {
                if (!this.KendoWidget) return [];
                var me = this, data =
                _.map(this.KendoWidget.items(), function (i) {
                    return me.KendoWidget._modelFromElement($(i));
                });
                return data;
            },

            getDataItem: function ($item) {
                var data = [], me = this;
                return me.KendoWidget && me.KendoWidget._modelFromElement($item)
            },

            setData: function (data) {
                this.KendoWidget && this.KendoWidget.dataSource.data(data || []);
            },

            getData: function () {
                return this.KendoWidget && this.KendoWidget.dataSource.data();
            },
            //----------------------------------------------------------

            onDataSourceReady: function (e, r) {

                if (!this._config.isDepending || !this.KendoWidget) return;
                // var data = this.KendoWidget.dataSource.reader.parse(r.Response);
                this.Query && (this.Query.DataSource.data = r.Response);
                //this.doRead();

                //if (!this._config.autoRead) {
                //    this.KendoWidget.dataSource.data(this.KendoWidget.dataSource.reader.parse(r.Response));
                //    this.KendoWidget.dataSource.read();
                //}
                //else {

                this.KendoWidget.dataSource.transport = {
                    read: function (args) {
                        args.success(args.data.response);
                    }
                };
                this.KendoWidget && this.KendoWidget.dataSource.read(e || r);


            },
            notifyDependables: function (data, response) {
                var AP = this.AP, block = AP.Model.getBlock(this.BlockId),
                  queries = block.get('Widget.Dependables.Queries');
                if (!queries) return;
                var d = data, r = response;
                r = this.KendoWidget.dataSource.options.schema.parse((data || response).response);
                _.each(queries, function (q) {
                    _.each(AP.View.$ViewRoot.find('.APWidget[data-query-id="' + q + '"]'), function (elt) {
                        var $elt = $(elt), widget = $elt.data('APWidget');
                        if (widget && widget.onDataSourceReady) widget.onDataSourceReady(d, r);
                    });
                });
            },

            // -----------------------------------------------------------------------------------

            setQuery: function (ExtraData) {

                var AP = this.AP, AppQuery = AP.Config.getQuery(this.QueryId),
                    SavedQuery = AP.Model.ViewModel.get('State.Query.' + this.QueryId), // All queries are saved in ModelView State
                    SavedQuery = SavedQuery ? SavedQuery.toJSON() : {};

                this.Query = $.extend(true, {}, AppQuery, SavedQuery, ExtraData);
                AP.Model.ViewModel.set('State.Query.' + this.QueryId, this.Query); // Actualize saved query				
            },

            fetch: function (Args) {

                // Grid reconstruction with a new query
                this.QueryId = Args.QueryId;
                this.setQuery(Args.QueryData);
                this.setup();
                // this.KendoWidget.dataSource.read();
            },

            refresh: function () {

                var AP = this.AP, SavedQuery = AP.Model.ViewModel.get('State.Query.' + this.QueryId), // All queries are saved in ModelView State
                    Query = SavedQuery ? SavedQuery.toJSON() : {},
                    QueryData = Query.Form, // Data for render form 
                    QueryDataForDataSource = Query.QueryJsonData == null ? AP.Model.DataSource.adaptQueryDataForDataSource(QueryData) : Query.QueryJsonData;

                this.Query = SavedQuery;

                this.KendoWidget.dataSource.read(QueryDataForDataSource);

                this.$Block.hasClass('InTabStrip') && this.isInTabStrip();
            },

            // -----------------------------------------------------------------------------------

            clear: function () {

                if (this.KendoWidget) { this.KendoWidget.destroy(); };
                this.$Widget.empty();
                this.$Widget.kendoListView(this._config);
                this.KendoWidget = this.$Widget.data('kendoListView');
            },

            //----------------------------------------------------------------------------
            refreshDataSource: function () {
                var AP = this.AP, SavedQuery = AP.Model.ViewModel.get('State.Query.' + this.QueryId);
                var SavedQuery = SavedQuery ? SavedQuery.toJSON() : SavedQuery;
                this.setQuery();
                var CompoundDataSource = AP.Model.DataSource.getDataSource(this.Query),
                       QueryData = CompoundDataSource.QueryData,
                       DataSource = CompoundDataSource.DataSource;
                if (this.KendoWidget) {
                    this.KendoWidget.setDataSource(new kendo.data.DataSource(DataSource));
                }
                this.doRead();
            },

            //----------------------------------------------------------------------------
            doRead: function () {
                if (this._config.autoBind === false && this.KendoWidget && this.KendoWidget.dataSource)
                    this.KendoWidget.dataSource.read();
            },
            // -----------------------------------------------------------------------------------

            setup: function () {

                var Me = this, AP = Me.AP,
                    Config = {};

                if (this.Query) {

                    var CompoundDataSource = AP.Model.DataSource.getDataSource(this.Query),
                        QueryData = CompoundDataSource.QueryData,
                        DataSource = CompoundDataSource.DataSource,
                    QueryDataForTitle = AP.Model.DataSource.adaptQueryDataForDataSource(this.Query.Form);

                    /* Set ListView Title */
                    var title = QueryDataForTitle.APTitle && Me.Query;
                    if (title) {

                        AP.Utils.setBlockTitle(this.$Block, title);
                        this.HasFields = 'HasFields';
                        this.$Block.addClass(this.HasFields)
                    } else {
                        this.HasFields = null;
                        this.$Block.removeClass(this.HasFields)
                    }

                    this._config = $.extend(true, this._config, { dataSource: DataSource });
                }

                if (this.KendoWidget) { this.KendoWidget.destroy(); };
                this.$Widget.empty();

                !this._config.autoBind && this._config.dataSourcePath && this.$Widget.attr('data-bind', 'source:' + this._config.dataSourcePath);

                this.$Widget.kendoListView(this._config);
                this.KendoWidget = this.$Widget.data('kendoListView');
                Me.KendoWidget && Me.KendoWidget.element.on('click', '[data-command]', $.proxy(Me._executeCommand, Me));

                this._config.customScroll && this.KendoWidget.element.addClass('custom-scrollable');

                this._setupDraggables();

                if (this._config.navigatable) {
                    this.$Block.append("<div id='pager' class='k-pager-wrap'></div>");
                    this.$Block.find("#pager").kendoPager({ dataSource: this.KendoWidget.dataSource });
                }


                /* Texts */
                this.translateTexts();
            },
            _executeCommand: function (e) {
                e.preventDefault();
                var $btn = $(e.currentTarget),
                   command = $btn.attr('data-command');
                if (!this.KendoWidget) return;
                var $item = $btn.parents('[role=option]'),
                   data = this.getDataItem($item),
                   statusTracker = this._config.statusTracker;

                if (!data && $btn.is('[role=option]')) {
                    $item = $btn;
                    data = this.getDataItem($item);
                };

                if (!data) return;
                var args = {
                    command: command,
                    rowData: data,
                    handled: false,
                    preventRefresh: false,
                    $item: $item,
                    $target: $btn
                };
                this.routeEvent('command', args);
                if (!args.handled) {

                    switch (command) {

                        case 'destroy':
                            this.KendoWidget.remove($btn.parents('[data-uid]'));
                            break;
                    }
                }
                else {
                    e.stopPropagation();
                };

                !args.preventRefresh && this._config.refreshAfterCommand && this.KendoWidget.refresh();
            },

            // -----------------------------------------------------------------------------------

            change: function (e, selected) {
                this.routeEvent('change', {
                    e: e,
                    selectedItem: selected || this.KendoWidget._modelFromElement(this.KendoWidget.select()),
                    CanRepeat: true
                });
            },
            _draggableOnDragStart: function (e) {

            },
            _draggableOnDragEnd: function (e) {

            },
            _droppableOnEnter: function (e) {
                this.$Block.addClass(this._config.dragEnterClass);
            },
            _droppableOnLeave: function (e) {
                this.$Block.removeClass(this._config.dragEnterClass);
            },
            _droppableOndrop: function (e) {
                this.$Block.removeClass(this._config.dragEnterClass);
                if (!e.draggable || !e.draggable.model) return;
                var me = this, predicate = {};
                if (me._config.uniqueIdField) {
                    predicate[me._config.uniqueIdField] = e.draggable.model[me._config.uniqueIdField];
                    var found = _.findWhere(this.getData(), predicate);
                    if (found) return;
                }
                var data = e.draggable.model.toJSON ? e.draggable.model : e.draggable.model.toJSON();
                me.KendoWidget.dataSource.add(data);
            },
            _setupDropTarget: function () {
                var me = this;
                this._config.dropTarget && this.$Block.kendoDropTarget({
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
                this._config.dragEnabled && me.KendoWidget.element.kendoDraggable({
                    filter: '[data-uid]',
                    hint: function (e) {
                        //debugger;
                        return $(this.element).clone();
                    },
                    dragstart: function (e) {
                        me._draggableOnDragStart(e);
                    },
                    dragend: function (e) {
                        me._draggableOnDragEnd(e);
                    }
                });

            },
            databound: function (e) {
                this._config.animateItems && this._animateBoxes();  // Animate list items if animateItems is set true
                //this._refreshHandler();
                this.KendoWidget && this.routeEvent('databound', {
                    e: e,
                    sender: this.KendoWidget,
                    CanRepeat: true
                });
            },

            error: function (e) {

                if (this.HasMessageBar && e.errors) { this.MessageBar.displayErrors(e.errors); };

                this.route('error', {
                    e: e,
                    CanRepeat: true
                });
            },

            requestend: function (e) {
                try {
                    // this.Query.DataSource.schema.parse(e.response, AP);
                    if (this.HasMessageBar && e.response) {
                        this.MessageBar.displayMessage(this.Query.Message);
                    }
                    else {
                        this.Query.Message.Key = 'api:query.norecords';
                        //this.MessageBar.displayMessage(this.Query.Message);
                    }
                } catch (e) {

                }

                this.notifyDependables(e, e);
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

                var AP = this.AP, Row = Args.Row,
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

                    if (!this.DeletingQueue[ItemIndex].Processed) { AllProcessed = false; };
                };

                if (AllProcessed) {
                    this.routeEvent('finishdeleting', {
                        AllSuccess: AllSuccess
                    });
                }
            },

            // -----------------------------------------------------------------------------------

            isInTabStrip: function () {

                if (this.Query) {

                    var QueryData = this.Query.Form, // Data for render form 
                        QueryDataForDataSource = this.AP.Model.DataSource.adaptQueryDataForDataSource(QueryData),
                        NewTitle = QueryDataForDataSource.APTitle || this.Query.Title || '';

                    this.changeTabTitle(NewTitle);
                }
            },

            // -----------------------------------------------------------------------------------

            changeTabTitle: function (NewTitle) {

                var InTabIndex = parseInt(this.$Block.attr('data-in-tab-index')),
                    $ParentTabStripTab = this.$Block.parents('.APReorderableTabStrip').eq(0)
                                                    .find('> .Blocks > .TabBar li').eq(InTabIndex),
                    $Title = $ParentTabStripTab.find('.Title');

                $Title.html(NewTitle);
            },
            // -----------------------------------------------------------------------------------

            translateTexts: function () {

                baseWidget.fn.translateTexts.call(this);
                var AP = this.AP;
                this.$Block.find('*[data-title]')
                .each(function () {

                    var $this = $(this),
                        KeyText = $this.attr('data-title'),
                        Text = KeyText ? AP.View.Internationalize.translate(KeyText) : '';

                    $this
                    .attr('data-title', Text)
                    .html(Text);
                });
            },

            _animateBoxes: function (reverse) {
                var $elts = this.$Block.find(this._config.selector), me = this;
                if (!reverse) $elts.css({ opacity: 0, transform: 'translate(500px) scale(0.5)' });
                var i = 0, onComplete = function () {
                    utils.invokeAsync(function () {
                        this.AP.Controller.route('bind');
                        this.AP.View.refreshScrollables();
                        this.routeEvent('loadComplete', {
                            CanRepeat: true
                        });
                    }, me, null, 300);
                };
                utils.loopAsync($elts, $.proxy(function (elt, next) {
                    ++i;
                    var opt = { duration: reverse ? 250 : 500 };
                    (i == $elts.length) && (opt.complete = onComplete);
                    this._animateBox($(elt), opt, reverse);
                    _.delay(next, 60);
                }, this));
            },
            _animateBox: function ($e, opt, reverse) {
                var fx = kendo.fx($e), anim = fx.fadeIn().add(fx.zoom().startValue(0).endValue(1)).add(fx.zoomIn()).add(fx.slideInLeft());
                anim.duration(opt.duration);
                (reverse ? anim.stop().reverse() : anim.stop().play()).then(opt.complete);

            },
        });

        return { name: 'ListView', widget: exWidget };
    }
)
