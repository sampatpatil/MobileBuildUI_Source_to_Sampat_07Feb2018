
define(
[
     'ap/modules/view/widget/basewidgetwithdatasource'
],

function (baseWidgetWithDataSource) {


    'use strict';

    return baseWidgetWithDataSource.extend({
        isInTabStrip: function () {
            var q = this._query;
            if (q) {

                var QueryData = q.Form, // Data for render form 
                    QueryDataForDataSource = this.AP.Model.DataSource.adaptQueryDataForDataSource(QueryData),
                    NewTitle = QueryDataForDataSource.APTitle || q.Title || '';
                this.changeTabTitle(NewTitle);
            }
        },
        // -----------------------------------------------------------------------------------

        changeTabTitle: function (NewTitle) {
            if (!NewTitle) return;
            var InTabIndex = parseInt(this.$Block.attr('data-in-tab-index')),
                $ParentTabStripTab = this.$Block.parents('.APReorderableTabStrip').eq(0)
                                                .find('> .Blocks > .TabBar li').eq(InTabIndex),
                $Title = $ParentTabStripTab.find('.Title');

            $Title.html(NewTitle);
        }
    });
});