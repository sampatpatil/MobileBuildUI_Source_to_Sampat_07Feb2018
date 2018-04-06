define(['ap/modules/view/widget/basewidgetwithdatasource'],

   function (baseWidgetWithDataSource) {

       'use strict';
       var ATTACH_HANDLERS = 'ah',
          //var refreshListeners = function () {
          //    var $btns = this.$Block.find('a.k-button');
          //    $btns.off();
          //    var me = this;
          //    var $grid = me.$Block.closest('.APGrid.APWidget');
          //    var gridBlockID = $grid.attr('id');
          //    $btns.on('click', function (e) {
          //        e.preventDefault();
          //        if (!$(e.currentTarget).is(':disabled')) {

          //            AP.Controller.route('event/modulebutton', {
          //                BlockId: me.gridBlockID,
          //                ModuleID: me.BlockId,
          //                Module: me.Module,
          //                e: e,
          //                CanRepeat: true
          //            });
          //        }

          //        return false;
          //    });
          //};

          wid = baseWidgetWithDataSource.extend({
              _dataSrcConfig: null,
              _getDataSourceConfig: function () {
                  return this._dataSrcConfig;
              },
              onInit: function (AP, BlockId, Module) {
                  var Me = this;
                  this.BlockId = BlockId;
                  //this.Module = Module;
                  var $Block = this.$Block;
                  var $DetailBlock = this.$DetailBlock = Module.$DetailBlock;
                  if (Module.IsDataSourceRequired) {
                      this.QueryId = Module.QueryId;

                      var Me = this;
                      this._dataSrcConfig = {
                          requestEnd: function (E) {
                              Me.requestend(E, Module);
                          },
                          error: function (E) {
                              Me.error(E, Module);
                          }
                      };
                      this.buildDatasource(Module.Data);
                  } else if (Module.IsWidget) this._createWidget(Module, null);
                  else {
                      var GridDetailed = AP.View.Templates.renderTemplate(Module.Template, Module);
                      if (Module.Executable) {
                          require([Module.Executable], function (exe) {                              
                              //exe.beforeAttach({ $Block: Me.$Block, html: GridDetailed, module: Module });
                              Me.$Block.html(GridDetailed);
                              exe.afterAttach({ $Block: Me.$Block, module: Module });
                              $DetailBlock.trigger(ATTACH_HANDLERS);
                              Me.translateTexts();
                          });
                      } else {                          
                          Me.$Block.html(GridDetailed);
                          $DetailBlock.trigger(ATTACH_HANDLERS);
                      }
                  }

                  this.translateTexts();
              },
              // -----------------------------------------------------------------------------------

              requestend: function (E, Module) {

                  var ModuleData = this.ObservableData.DataSource.schema.parse(E.response);
                  Module.Data = ModuleData;
                  this.$Block.data('ModuleData', ModuleData);
                  // var ModuleData = _.extend({}, Module, E.response);            
                  /*if (Module.DataBind) {
                       this.VM.set('Local', Module.Data);
                       this.$Block.html(AP.View.Templates.renderTemplate(Module.Template, this.VM));
                       this.$Block.trigger('refreshbinding');
                   } else*/
                  if (Module.IsWidget) {
                      this._createWidget(Module, ModuleData);
                  } else
                      this.$Block.html(this.AP.View.Templates.renderTemplate(Module.Template, Module));
                  this.$DetailBlock.trigger(ATTACH_HANDLERS);
                  this.translateTexts();
              },
              _createWidget: function (Module, ModuleData) {
                  var AP = this.AP;
                  Module.Widget.Data = ModuleData;
                  var $grid = this.$Block.closest('.APGrid'),
                     block = kendo.observable({
                         Class: Module.Class,
                         Widget: Module.Widget,
                         Template: Module.Template,
                         Type: Module.Type,
                         ParentId: $grid.data('id')
                     });
                  if (this.$ModuleBlock == null) {
                      this.$ModuleBlock = this.$Block.html('<div class="ModuleBlock"></div>').find('.ModuleBlock');
                      this.$ModuleBlock.addClass(block.Class);
                      this.ModuleBlockId = AP.Model.getNewBlockId()
                      this.$ModuleBlock.attr('id', AP.Model.getNewBlockId());
                  }
                  AP.Model.ViewModel.set('Blocks.' + this.ModuleBlockId, block);
                  var grid = $grid.data('APWidget'),
                     rowData;
                  if (grid) {
                      var $row = this.$Block.parents('tr').eq(0);
                      if ($row.is('.k-detail-row')) {
                          $row = $row.prev();
                      }

                      rowData = grid.getDataItem($row);
                      grid.routeEvent('beforeWidgetInit', {
                          widget: this,
                          BlockId: block.ParentId,
                          rowData: rowData,
                          ModuleId: Module.BlockId,
                          WidgetId: this.ModuleBlockId
                      });
                  }
                  var widget = AP.View.Widget.widgetize(this.ModuleBlockId, Module.Widget.Type, block);
                  this.$ModuleBlock.data('APWidget', widget);
                  widget.routeEvent('init', {
                      data: rowData
                  });
              },
              error: function (E, Module) {

                  console.log(E);
              }

          });
       return {
           name: 'GridDetailModule',
           widget: wid
       };
   }
);