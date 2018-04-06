
define(

    [
        'lib/modules/utilities',
        'kendo'
    ],

    function (
         utils
    ) {

        'use strict';

        var AP, parmFindRegex = /\(([^)]+)/, paramSplitRegex = /\s*,\s*/;


        var encodeParam = function (Param) {
            if (!Param) return Param;
            var EncodedParam = Param.split('.').join('*')
                                    .split('[').join('<|')
                                    .split(']').join('|>');

            return EncodedParam;
        };

        var createLocaleProperty = function (propertyName, value, isKey) {

            var propClass = function (propName, defaultVal, isResKey) {
                this[propName] = defaultVal;
                if (isResKey == null) isResKey = true;
                this.isKey = isResKey;
                this.getEncoded = function () {
                    var value = this.get(propName);
                    var isK = this.get ? this.get('isKey') == true : this.isKey;
                    return isK ? encodeParam(value) : value;
                }
            };
            propClass.prototype = { isKey: true, isLoaded: function () { return this.get ? !this.get('isLoading') : !this.isLoading; }, isLoading: false };
            propClass.prototype[propertyName] = null;
            return new propClass(propertyName, value, isKey);
        };
        /* Helpers */
        var windowManager = function (AP, config) {
            var _eltSelector = config.eltSelector, $elt = AP.View.$ViewRoot.find(_eltSelector), _currentWindow, _freetoShift = true;
            var _msgQ = [], options;
            var _create = function (options) {
                if (_currentWindow) {
                    _currentWindow.destroy();
                    _currentWindow = null;
                }
                if (AP.View.$ViewRoot.find(_eltSelector).length == 0)
                    $elt.appendTo(AP.View.$ViewRoot);
                options = options || {};

                if(!options.width) options.width = '700'; //set default width of window to 700 if not set in options -- this is to avoid full browser width window -- Phani
                
                $elt.kendoWindow(extendOptions(options));
                var window = $elt.data('kendoWindow');
                window.element.find('.buttons [data-role="button"]').kendoButton({
                    click: function (e) {
                        var action = this.element.data('action');
                        options.result && options.result({ action: action });
                        _currentWindow && _currentWindow.close();
                    }
                });
                return window;
            }, _createButtons = function (options) {
                var buttons = '';
                _.each(options.buttons || [], function (btn) {
                    var text = btn.hasOwnProperty('text') && AP.View.Internationalize.translate(btn.text);
                    if (!text) return;  // if value of text is false or empty,it skips the creation of buttons
                    buttons += kendo.format('<input type="button" value="{0}" class="{1}" data-role="button" data-action="{1}"/>', text, btn.action || btn.text);
                });
                return '<div class="buttons pull-right">' + buttons + '</div>';
            }, _createAndShow = function (options) {
                _currentWindow = _create(options);
                _currentWindow.bind('deactivate', this.shiftMsgQ);
                _currentWindow.bind('close', this.close);
                _freetoShift = false;
                _currentWindow.center().open();
            }, shiftMsgQ = function () {
                _freetoShift = true;
                var opt = _msgQ.shift();
                if (opt)
                    _createAndShow.call(this, opt);
            }, extendOptions = function (options) {
                var _getTitle = config.getTitle, _postGetContent = config.getContent, _getContent = config.getContent;
                if (options.buttons) {
                    _postGetContent = function (opts) {
                        var buttons = _createButtons(opts);
                        var content = _getContent(opts);
                        content.template = kendo.format('<div class="content">{0}</div>{1}', content.template, buttons);
                        return content;
                    };
                }
                var ext = $.extend(true, {}, options);
                ext.title = _getTitle(options);
                ext.content = _postGetContent(options);
                return ext;
            };

            this.shiftMsgQ = $.proxy(shiftMsgQ, this);

            this.show = function (options) {
                _msgQ.push(options);
                if (_freetoShift)
                    this.shiftMsgQ();

            };
            this.close = function () {
                this.options.result && this.options.result({ action: 'Close' }); // To continue its executing its opreations when closing the kendo window                
            }

        };

        var AgilePointUtils = kendo.Class.extend({
            init: function (AgilePoint) {

                AP = this.AP = AgilePoint;

                //this.syncroLESSVariables();
            },

            AP: null,


            // Kendo Bug in passing params to dependant methods

            encodeParam: encodeParam,

            decodeParam: function (EncodedParam) {

                var DecodedParam = EncodedParam.split('*').join('.')
                                               .split('<|').join('[')
                                               .split('|>').join(']');

                return DecodedParam;
            },

            removeKendoClasses: function ($El) {

                var Classes = $El.attr('class') || '',
                    ClassesArray = Classes.split(' '),
                    ClasesArrayNoKendo = _.filter(ClassesArray, function (Item) {

                        return !_.startsWith(Item, 'k-');
                    }),
                    ClassesNoKendo = ClasesArrayNoKendo.join(' ');

                $El.attr('class', ClassesNoKendo);
            },

            getJsonformatteddata: function (queryId, data, message) {
                var JsonData = {
                    "Id": queryId,
                    "Response": {
                        "Data": data,
                        "Message": {
                            "Key": "api:query.success",
                            "Values": ""
                        }
                    }
                }

                return JsonData;
            },

            normalizeSpaces: function (Str) {

                while (Str.indexOf('  ') != -1) { Str = Str.replace('  ', ' '); }

                Str = _.trim(Str);
                return Str;
            },

            // Dynamic setting of Block Title
            setBlockTitle: function ($Block, Title) {

                var $BlockFields = $Block.find('.Fields'),
                    HaveFields = $BlockFields.length > 0;

                if (!HaveFields) {

                    var FieldsHTML = AP.View.Templates.renderTemplate('blockfields', { AP: AP, Create: true });

                    $Block
                    .prepend(FieldsHTML)
                    .find('.Fields .Title').eq(0)
                    .removeAttr('data-bind')
                    .html(Title);
                } else {

                    $Block.find('.Fields .Title, .Fields > *[class="Field"]').eq(0)
                    .removeAttr('data-bind')
                    .html(Title);
                }
            },

            // Load app variables.less and make values availables
            // in AP.Less context with same name (without @)
            syncroLESSVariables: function () {

                var LessVariablesPath = AP.Config.Data.RootPath + 'css/base/variables.less', self = this;
                $.ajax({
                    async: true,
                    url: LessVariablesPath,
                    dataType: 'text',
                    context: this,
                    cache: false, // True for production
                    success: function (data, textStatus, jqXHR) {

                        var ParsedData = self.parseLESSVariables(data),
                            ParsedData = '{' + ParsedData + '}',
                            LessVariables = (
                                new Function('return ' + ParsedData)
                            )();

                        AP.Less = LessVariables;
                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                        console.log('Error loading less variables: ' + textStatus); // TODO Error management
                    }
                });

            },

            parseLESSVariables: function (data) {

                // TODO do proper regexp
                var Data = data.replace(/\s/g, ''),
                    Data = Data.replace(/@/g, ''),
                    Data = Data.replace(/:/g, ':"'),
                    Data = Data.replace(/;/g, '",'),
                    Data = Data.substring(0, Data.lastIndexOf(','));

                return Data;

            },

            getClassPath: function (BlockId, ClassPath) {

                var ClassPath = ClassPath || [],
                    Block = AP.Model.getBlock(BlockId);
                if (Block) {
                    var BlockClass = Block.get('Class'),
                    ParentBlockId = Block.get('ParentId'),
                    ParentBlock = AP.Model.getBlock(ParentBlockId);

                    if (BlockClass) ClassPath.unshift(BlockClass);
                    if (ParentBlock) { return this.getClassPath(ParentBlockId, ClassPath); }
                }
                return ClassPath;
            },

            getTargetWidgetByClassPath: function (SlashClassPath) {

                var DotsClassPath = '.' + SlashClassPath.replace(/\//g, ' .'),
                    $Block = $(DotsClassPath),
                    Widget = $Block.data('APWidget');

                return Widget;
            },

            getTargetKendoWidgetByClassPath: function (SlashClassPath) {

                var Widget = this.getTargetWidgetByClassPath(SlashClassPath),
                    KendoWidget = Widget.KendoWidget;

                return KendoWidget;
            },

            getBlockIdFromClassPath: function (SlashClassPath) {

                var DotsClassPath = '.' + SlashClassPath.replace(/\s/g, '.').replace(/\//g, ' .'),
                    $Block = $('#' + AP.Model.MainBlockId + ' ' + DotsClassPath),
                    BlockId = $Block.attr('data-id');

                return BlockId;
            },

            getTargetWidgetByBlockId: function (BlockId) {

                var $Block = AP.View.getBlock(BlockId),
                    Widget = $Block.data('APWidget');

                return Widget;
            },

            getTargetKendoWidgetByBlockId: function (BlockId) {

                var Widget = this.getTargetWidgetByBlockId(BlockId),
                    KendoWidget = Widget.KendoWidget;

                return KendoWidget;
            },
            parseJsonDateToString: function (jsonDate, excludeTime) {
                if (!jsonDate) return '';

                //var ParsedDate = new Date(+Parts[1] + Offset + Parts[2] * 3600000 + Parts[3] * 60000);
                var ParsedDate = kendo.parseDate(jsonDate, null, null, true);
                if (!ParsedDate || isNaN(ParsedDate.getFullYear()) || ParsedDate.getFullYear() < 1970)
                    return '';
                //var DateString = ((ParsedDate.getMonth() + 1) < 10 ? "0" + (ParsedDate.getMonth() + 1) : (ParsedDate.getMonth() + 1)) + "/" + (ParsedDate.getDate() < 10 ? "0" + ParsedDate.getDate() : ParsedDate.getDate()) + "/" + ParsedDate.getFullYear();

                var DateString = ParsedDate.toLocaleDateString();
                if (!excludeTime) DateString += kendo.toString(ParsedDate, ' HH:MM:ss');

                //TODO :Formatting javascript date like 'mm/dd/yyyy hhmmss'
                var date = ParsedDate;
                var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
                var day = (date.getDate() + 1) > 9 ? (date.getDate()) : "0" + (date.getDate());
                var hours = (date.getHours()) > 9 ? (date.getHours()) : "0" + (date.getHours());
                var minutes = (date.getMinutes()) > 9 ? (date.getMinutes()) : "0" + (date.getMinutes());
                var seconds = (date.getSeconds()) > 9 ? (date.getSeconds()) : "0" + (date.getSeconds());
                DateString = month + "/" + day + "/" + date.getFullYear() + " " + hours + ":" + minutes + ":" + seconds;

                // return kendo.toString(ParsedDate, "dd/mm/yyyy - hh:mm:ss")
                //return DateString != '12/31/0' ? DateString : '';
                return DateString != '01/01/1' ? DateString : '';
            },
            parseJsonDate: function (jsonDate, format) {
                if (!jsonDate) return '';




                //var ParsedDate = new Date(+Parts[1] + Offset + Parts[2] * 3600000 + Parts[3] * 60000);
                var ParsedDate = kendo.parseDate(jsonDate, null, null, true);
                if (!ParsedDate || isNaN(ParsedDate.getFullYear()) || ParsedDate.getFullYear() < 1970)
                    return '';
                //var DateString = ((ParsedDate.getMonth() + 1) < 10 ? "0" + (ParsedDate.getMonth() + 1) : (ParsedDate.getMonth() + 1)) + "/" + (ParsedDate.getDate() < 10 ? "0" + ParsedDate.getDate() : ParsedDate.getDate()) + "/" + ParsedDate.getFullYear();
                var DateString;
                if (format)
                    DateString = kendo.toString(ParsedDate, format);
                else DateString = ParsedDate.toLocaleDateString();

                // return kendo.toString(ParsedDate, "dd/mm/yyyy - hh:mm:ss")
                //return DateString != '12/31/0' ? DateString : '';
                return DateString != '01/01/1' ? DateString : '';
            },

            getdatediffweeks: function (date) {

                var d1 = new Date(date);
                var d2 = new Date();
                var t2 = d2.getTime();
                var t1 = d1.getTime();
                var val = parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
                return (val < 0 ? 0 : val);
            },

            invokeAsync: utils.invokeAsync,

            loopAsync: utils.loopAsync,

            saveToFile: utils.saveToFile,


            windowManager: windowManager,
            serializeToHTMLAtrr: function (data, prependKey) {
                if (!data) return '';
                prependKey = prependKey || '';
                var res = [];
                _.map(data.toJSON ? data.toJSON() : data, function (v, k) {
                    res.push(k + '="' + v + '"');
                });
                return res.join(' ');
            },
            _generateBindingProp: function (binding) {
                var str = [], me = this;
                _.each(binding, function (v, k) {
                    var val = '';
                    if (_.isObject(v))
                        val = k + ': {' + me._generateBindingProp(v) + '}';
                    else
                        val = k + ':' + v;
                    val && str.push(val);
                });
                return str.join(',');
            },
            generateBindings: function (bindings) {
                var res = [], me = this;

                var res = bindings && _.map(bindings.toJSON ? bindings.toJSON() : bindings, function (binding) {
                    return me._generateBindingProp(binding);
                });
                return (res || []).join(',');
            },
            generateBindingsAttr: function (bindings) {
                var bindings = this.generateBindings(bindings);
                return bindings ? 'data-bind="' + bindings + '"' : '';
            },
            updateObservable: function (obs, data) {
                obs && obs.set && data && _.each(data, function (v, k) {
                    obs.set(k, v);
                });
            },
            getRouteParams: function (route) {
                var results = parmFindRegex.exec(route) || [];
                return results.length > 1 ? results[1].split(',') : [];
            },
            getCurrentRouteParams: function () {
                return this.getRouteParams(_.last(AP.Controller.Hasher.getHashAsArray()));
            },
            generateValidationConfig: function (field) {
                var attrStr = '', validation = field.validation;
                if (validation) {
                    for (var key in validation.toJSON ? validation.toJSON() : validation) {
                        if (key != 'uid' && validation.hasOwnProperty(key)) {

                            switch (key) {
                                case 'required':
                                    attrStr += 'required';
                                    break;
                                case 'pattern':
                                    attrStr += kendo.format(' pattern={0} ', validation.pattern);
                                case 'rules':
                                    attrStr += kendo.format(' data-rules={0} ', validation.rules);
                                    break;
                                default:
                                    attrStr += ' ' + key + '="' + validation[key] + '"';
                                    break;
                            }
                        }
                    }
                   
                }
                return attrStr;
            }
        });

        //Creating static method in utils module
        AgilePointUtils.createLocaleProperty = createLocaleProperty;
        return AgilePointUtils;
    }
);
