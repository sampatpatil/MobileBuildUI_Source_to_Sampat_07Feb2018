define(['jquery', 'underscore'], function ($, _) {
    $.fn.ApplicationFilterConfigs = function (options) {
        var $this = $(this);
        var $options = $.extend({
            auth: '',
            url: '',
            jsonData: '',
            inputElem: '',
            storeBy: 'DefName'
        }, options);
        var treeviewReader = {
            get: function () {
                var checkedNodes = [],
                elems = $this.find(".k-checkbox :checked").closest('li').find('.k-in');
                checkedNodeIds(elems, checkedNodes);
                $options.inputElem.val(checkedNodes.toString());
                return checkedNodes.toString();
            }
        };
        $this.data('reader', treeviewReader);
        //$options.inputElem.val($this.html());

        $(document).on('click', '.reset', function (e) {
            var elems = $this.find(".k-checkbox :checked");
            $.each(elems, function (i, o) {
                $(o).prop("checked", false);
            });
            //$options.inputElem.val("");
        });

        var request = function (opts) {
            return $.ajax($.extend(opts, {
                dataType: 'json',
                url: $options.url,
                headers: {
                    "Authorization": $options.auth,
                    "appID": "Portal",
                    "Access-Control-Allow-Headers": "*"
                },
                type: 'POST',
                processData: false,
                contentType: "application/json",
                dataType: "json",
                async: true,
                data: JSON.stringify($options.jsonData),
            }));
        };
        var ProcDefs = [];
        var Configdata = [];

        var deferred = $.Deferred();
        request().fail(deferred.fail)
                 .done(function (data) {
                     if (data != null && data.length > 0) {
                         ProcDefs = data;
                         $.each(data, function (i, obj) {
                             var ReleaseDate = kendo.parseDate(obj.ReleaseDate);
                             obj.ReleaseDateObj = ReleaseDate;
                         });
                         //ProcDefs = _.sortBy(data, 'ReleaseDateObj').reverse();
                         //var appname = _(ProcDefs).chain().flatten().pluck('ApplName').unique().value();
                         //Configdata = _.chain(ProcDefs).groupBy('ApplicationDisplayName').map(function (value, key) {
                         //    return { Appkey: key, items: value };
                         //}).value();
                         Configdata = _.chain(data).sortBy('ApplName').pluck('ApplName').unique().map(function (value, key) {
                             return { Appkey: value };
                         }).value();
                         bindtreeview();
                     }
                 });

        function bindtreeview() {
            $this.kendoListView({
                //checkboxes: {
                //    checkChildren: true
                //},
                //dataTextField: "Appkey",
                //select: function (e) {
                //    var text = $(e.node).find('.k-in').html().toString();
                //    var treeview = $this.data("kendoTreeView");
                //    treeview.expand(treeview.findByText(text));
                //},
                //change: function (e) {
                //    onCheck(e);
                //},
                dataSource: Configdata,
                //template: '<div class="form-row"><label>#:data.Appkey#</label><fieldset><input id="switch2" type="checkbox" class="input-switch" data-config-key="" data-config-group=""><label for="switch2"></label><span class="switch-bg"></span><span data-on="Yes" data-off="No" class="switch-labels"></span></fieldset></div>',
                template: '<div class="FilterListItem"><input class="k-checkbox" type="checkbox" /><span class="ItemName">#:data.Appkey#</span></div>'
            });
            //$this.find("input[type='checkbox']").on('change', function (e) {
            //    var treeitem = $(e.target).closest('li').find('.k-in:first');
            //    var treeview = $this.data("kendoTreeView");
            //    var item = treeview.findByText(treeitem.html());
            //    treeview.select(item);
            //    // onCheck(e);
            //});
            //databind();
            $options.onload && $options.onload();
            $this.show();

        }
        // function that gathers IDs of checked nodes
        function checkedNodeIds(nodes, checkedNodes) {
            var nodeitems = [];
            $.each(nodes, function (i, o) {
                var node = _.find(ProcDefs, function (item) { return (item.ProcessDefinitionDisplayName == $(o).html()) ? item.DefName : ""; })
                node && nodeitems.push(node);
            });
            checkedNodes.push(_(nodeitems).chain().flatten().pluck($options.storeBy).unique().value());

        }

        // show checked node IDs on datasource change
        function onCheck(e) {
            var checkedNodes = [],
                elems = $this.find(".k-checkbox :checked").closest('li').find('.k-in');
            checkedNodeIds(elems, checkedNodes);
            $options.inputElem.val(checkedNodes.toString());
        }

        function databind() {
            var input = $options.inputElem.val();
            var treeview = $this.data("kendoTreeView");
            if (input != undefined && input.length > 0) {
                var values = input.split(',')
                if ($options.storeBy == "DefName") {
                    $.each(values, function (i, obj) {
                        var node = _.find(ProcDefs, function (item) { return (item.ProcessDefinitionDisplayName == obj) ? item.DefName : ""; });
                        if (node != undefined && node != null) {
                            var item = treeview.findByText(node.ProcessDefinitionDisplayName);
                            $(item).find("input[type='checkbox']").prop('checked', true);
                            $(item).find("input[type='checkbox']").trigger('change');
                        }
                    });
                }
                else {
                    $.each(values, function (i, obj) {
                        var node = _.find(ProcDefs, function (item) { return item.BaseDefID == obj; })
                        if (node != undefined && node != null) {
                            var item = treeview.findByText(node.ProcessDefinitionDisplayName);
                            $(item).find("input[type='checkbox']").prop('checked', true);
                            $(item).find("input[type='checkbox']").trigger('change');
                        }
                    });
                }

                $options.success();
            }
        }

        return $;
    }
});