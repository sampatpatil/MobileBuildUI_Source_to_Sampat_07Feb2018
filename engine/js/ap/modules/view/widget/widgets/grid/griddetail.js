
define([],

    function () {

        'use strict';

        var AgilePointWidgetsGridDetail = function (AP, BlockId, Detail) {

            this.BlockId = BlockId;
            this.AP = AP;
            var $Block = this.$Block = $('#' + this.BlockId);
            this.GridBlockId = Detail.GridBlockId;
            this.Data = Detail.Data;
            var Block = AP.Model.getBlock(Detail.GridBlockId);
            this.HasToolBarTitle = Block.get('Widget.Config.Detail.toolbar.Config.toolbartitle') ? 'HasToolBarTitle' : '';

            var Me = this;
            Me.attachEventHandlers();
            _.each(Detail.Modules, function (Module, Index) {

                var ModuleUID = BlockId + '_' + Index,
                    ModuleData = _.extend({},
                                          Module,
                                          {
                                              $DetailBlock: $Block,
                                              BlockId: ModuleUID,
                                              Data: this.Data
                                          });

                this.$Block.append(AP.View.Templates.renderTemplate('widget/grid/griddetailmodule', ModuleData));

                $('#' + ModuleUID).data('APWidget',
                     AP.View.Widget.widgetize(ModuleUID,
                                             'APGridDetailModule',
                                              ModuleData));
            }, this);

            if (Detail.toolbar) {

                this.$Block.append(AP.View.Templates.renderTemplate('widget/toolbar/toolbarwrapper', Detail));
                this.ToolBarBlockId = 'ToolBar_' + BlockId;

                var $ToolBarBlock = $('#' + this.ToolBarBlockId);
                $ToolBarBlock.data('APWidget', AP.View.Widget.widgetize(this.ToolBarBlockId,
                                                                       'APToolBar',
                                                                        Detail.toolbar));
                this.ToolBar = $ToolBarBlock.data('APWidget');

                this.ToolBar.activateButtons(Detail.activateButtons || ['migrate']);

                if (this.HasToolBarTitle != '') {
                    var MenuTitleKey = Detail.toolbar.Config.toolbartitle,
                    MenuTitleHTML = AP.View.Templates.renderTemplate('widget/toolbar/toolbarmenutitle', { TitleKey: MenuTitleKey, QueryId: this.$Block.get('Widget.QueryId') || '', Data: Detail.Data });
                    $ToolBarBlock.prepend(MenuTitleHTML);
                }
            }

        };

        AgilePointWidgetsGridDetail.prototype.attachEventHandlers = function () {
            var Me = this,
            $btns = this.$Block
            .off('click')
           .on('click', '.k-button:not("[disabled=disabled]")', function (e) {
               e.preventDefault();
               var $this = $(this);
               //if ($(e.currentTarget).is(':disabled')) return false;
               var grid = Me.AP.View.getBlock(Me.GridBlockId).data('APWidget');
               switch ($this.data('action')) {
                   case 'refreshDetail':
                       if (!$this.data('override')) {
                           var id = $this.parents('.Detail.APWidget').attr('id');
                           var grid = $this.parents('.APGrid').first().data('APWidget');
                           grid && grid.refreshDetail(id);
                           break;
                       }
                   default:
                       grid && grid.routeEvent('detail', {
                           e: e,
                           CanRepeat: true
                       });
                       break
               }

               return false;
           });
        };

        AgilePointWidgetsGridDetail.prototype.destroy = function () {

        };

        return { name: 'GridDetail', widget: AgilePointWidgetsGridDetail };
    }
);
