/// <reference path="../../../../app.js" />
define(['kendo',
    'lib/modules/encoders',
    'lib/modules/utilities',
    'lib/modules/kendo.codemirror',
    'lib/modules/jquery-mousewheel',
    'lib/modules/jquery.panzoom',
    'lib/modules/sliderex',
    'lib/modules/jquery.pageslide'], function (k, encoders, utils, kendoCM) {
        var base64 = encoders.base64;
        var DATABINDING = "dataBinding", DATABOUND = "dataBound", CHANGE = "change", ZOOMCHANGE = 'zoomchange', CONTENTCHANGE = 'contentchange', CONFIGCHANGE = 'configchange';
        var Binder = kendo.data.Binder, Widget = kendo.ui.Widget;
        var createBindings = function (bindings, source, type) {
            var binding,
                result = {};

            for (binding in bindings) {
                result[binding] = new type(source, bindings[binding]);
            }

            return result;
        };

        kendo.data.binders.appendClass = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);

                var that = this;
                that["cssStr"] = $(this.element).attr('class');
                that['last'] = '';
            },
            refresh: function () {
                var that = this,
                    value = that.bindings["appendClass"].get(); //get the value from the View-Model
                var $elt = $(that.element);
                var mutatedVal = ($elt.data('prependClass') || '') + value;
                if (that["last"] != mutatedVal)
                { $elt.removeClass(that["last"]); }
                that["last"] = mutatedVal;
                $elt.addClass(mutatedVal); //update the HTML element
            }
        });

        kendo.data.binders.readonly = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);

                var that = this;
            },
            refresh: function () {
                var that = this,
                    value = that.bindings["readonly"].get(); //get the value from the View-Model
                var $elt = $(that.element);
                $elt.prop('readonly', value ? true : false);

            }
        });

        kendo.data.binders.visibleEx = kendo.data.binders.widget.visibleEx = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var me = this,
                    value = me.bindings["visibleEx"].get(); //get the value from the View-Model
                var $elt = $(me.element);
                var widget = $elt.data('APWidget');
                $elt[value ? 'show' : 'hide']();
                widget && widget.onVisibilityChanged && widget.onVisibilityChanged(value);
            }
        });

        kendo.data.binders.filter = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
            },
            _filterCache: '',
            refresh: function () {
                var me = this,
                    value = me.bindings["filter"].get(); //get the value from the View-Model
                var $elt = $(me.element);
                var widget = $elt.data('APWidget');

                var filterStr = JSON.stringify(value || []);

                (filterStr != this._filterCache) && widget && (widget.filter && widget.filter(value),
                widget.applyFilter && widget.applyFilter(value),
                (this._filterCache = filterStr));


            }
        });

        kendo.data.binders.setData = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var me = this,
                    value = me.bindings["setData"].get(); //get the value from the View-Model
                var $elt = $(me.element);
                var widget = $elt.data('APWidget');

                widget && widget.setData && widget.setData(value);
            }
        });


        kendo.data.binders.applyFilter = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var me = this,
                    value = me.bindings["applyFilter"].get(); //get the value from the View-Model
                var $elt = $(me.element);
                var widget = $elt.data('APWidget');

                widget && widget.applyFilter && widget.applyFilter(value);
            }
        });

        // Binder to set or remove attribute.
        kendo.data.binders.toggleAttr = Binder.extend({
            init: function (element, bindings, options) {
                var newBindings = { toggleAttr: {} };
                $.each(bindings.toggleAttr.path, function (key, value) {
                    newBindings.toggleAttr[key] = $.extend(true, {}, bindings.toggleAttr, { path: value })
                });
                this.prevBindings = bindings;
                //call the base constructor
                Binder.fn.init.call(this, element, newBindings, options);
            },
            refresh: function () {
                var me = this,
                    bindingClassConfigs = me.bindings.toggleAttr,
                    $elt = $(me.element);

                $.each(bindingClassConfigs, function (key, value) {
                    if (value.get()) {
                        $elt.attr(key, value);
                    }
                    else {
                        $elt.removeAttr(key);
                    };
                });
            }
        });

        // Css class binder.
        kendo.data.binders.css = Binder.extend({
            init: function (element, bindings, options) {
                var newBindings = { css: {} };
                $.each(bindings.css.path, function (key, value) {
                    newBindings.css[key] = $.extend(true, {}, bindings.css, { path: value })
                });
                this.prevBindings = bindings;
                //call the base constructor
                Binder.fn.init.call(this, element, newBindings, options);
            },
            refresh: function () {
                var me = this,
                    bindingClassConfigs = me.bindings.css,
                    $elt = $(me.element);

                $.each(bindingClassConfigs, function (key, value) {
                    if (value.get()) {
                        $elt.addClass(key);
                    }
                    else {
                        $elt.removeClass(key);
                    };
                });
            }
        });

        // Data attribute binder.
        kendo.data.binders.dataAttr = Binder.extend({
            init: function (element, bindings, options) {
                var newBindings = { dataAttr: {} };
                $.each(bindings.dataAttr.path, function (key, value) {
                    newBindings.dataAttr[key] = $.extend(true, {}, bindings.dataAttr, { path: value })
                });
                this.prevBindings = bindings;
                //call the base constructor
                Binder.fn.init.call(this, element, newBindings, options);
            },
            refresh: function () {
                var me = this,
                    bindingClassConfigs = me.bindings.dataAttr,
                    $elt = $(me.element);

                $.each(bindingClassConfigs, function (key, value) {
                    $elt.data(key, value.get());
                });
            }
        });


        kendo.data.binders.visibleExToolbar = kendo.data.binders.widget.visibleEx = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var me = this,
                    value = me.bindings["visibleExToolbar"].get(); //get the value from the View-Model
                var $elt = $(me.element);
                var widget = $elt.closest('.APGrid').data('APWidget');
                widget && widget[(value ? 'show' : 'hide') + 'ExToolbar']();
                //widget && widget.onVisibilityChanged && widget.onVisibilityChanged(value);
            }
        });

        kendo.data.binders.invisibleEx = kendo.data.binders.widget.invisibleEx = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var me = this,
                    value = me.bindings["invisibleEx"].get(); //get the value from the View-Model
                var $elt = $(me.element);
                var widget = $elt.data('APWidget');
                $elt[value ? 'hide' : 'show']();
                widget && widget.onVisibilityChanged && widget.onVisibilityChanged(value);
            }
        });

        kendo.data.binders.animateHTML = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);

                var that = this;
                that['fx'] = kendo.fx($(element)).fadeIn();

            },
            refresh: function () {
                var that = this,
                    value = that.bindings["animateHTML"].get(); //get the value from the View-Model
                var $elt = $(that.element), fx = that.fx;
                // to make sure not to animate multiple times
                if ($.trim(value) !== $.trim($elt.html())) {
                    $elt.html(value); //update the HTML element
                    fx.play();
                }
            }
        });

        kendo.data.binders.toggleClass = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);

                var that = this;
                that['cssStr'] = $(this.element).attr('class');
                that['last'] = '';
            },
            refresh: function () {
                var that = this,
                    value = that.bindings['toggleClass'].get(); //get the value from the View-Model
                var $elt = $(that.element);
                if (that['last'] != value)
                { $elt.removeClass(that['last']); }
                that['last'] = value;
                $elt.addClass(value); //update the HTML element
            }
        });

        kendo.data.binders.widget.searchText = Binder.extend({
            init: function (element, bindings, options) {
                this._dataBound = $.proxy(this._dataBound, this);
                Binder.fn.init.call(this, element, bindings, options);
            },
            _st: '',
            refresh: function () {
                var st = this.bindings.searchText.get();
                if (st == this._st || st == this.element.value()) return;
                this._st = st;
                //this.element.text(this._st);
                this._st && (this.element.search(this._st), this.element.selectValue && this.element.selectValue(this._st));
            },
            change: function (v) {
                this.bindings.searchText.set(v);
            }
        });

        kendo.data.binders.widget.imageSrc = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);

                var that = this;

            },
            refresh: function () {
                var that = this,
                    value = that.bindings["imageSrc"].get(); //get the value from the View-Model

                if (value) {
                    var data = value.data;
                    switch (value.format) {
                        case 'base64':
                            data = kendo.format('data:image/{0};base64,{1}', value.type, value.data);
                            break;
                    }

                    that.element.setSrc && that.element.setSrc(data, true);
                }
            }
        });

        kendo.data.binders.widget.config = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor
                Binder.fn.init.call(this, element, bindings, options);
                //element.bind(CONFIGCHANGE, $.proxy(this.change, this));
            },
            refresh: function () {
                this.element.setConfig(this.bindings['config'].get(), true);
            },
            change: function (val) {
                this.bindings["config"].set(this.element.config);
            }
        });

        kendo.data.binders.widget.content = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
                element.bind(CONTENTCHANGE, $.proxy(this.change, this));
            },
            refresh: function () {

            },
            change: function (v) {
                this.bindings["content"].set(v);
            }
        });

        kendo.data.binders.widget.fileExtension = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
                element.bind('contentLoaded', $.proxy(this.setFileExtension, this));
            },
            refresh: function () {

            },
            setFileExtension: function (v) {
                var nameArray = v.fileName.split('.');
                this.bindings["fileExtension"].set(nameArray[nameArray.length - 1]);
            }
        });

        kendo.data.binders.visibletoextend = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var v2e = this.bindings['visibletoextend'].get();
                $(this.element).data('visibletoextend', v2e ? true : false);
            }
        });


        kendo.data.binders.widget.dataex = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var data = this.bindings['dataex'].get();
                var dx = data || {};
                var opt = $.extend(this.element.options, dx.toJSON ? dx.toJSON() : dx, { dataSource: null });

                (JSON.stringify(this.element.options) != JSON.stringify(opt)) && this.element.setOptions(opt);
                (data && data.source && (!this.element._dsrc || (data.source.id != this.element._dsrc.id)))
                && (this.element._dsrc = data.source, this.element.setDataSource && this.element.setDataSource(this.element._dsrc.getter(this.element._dsrc.id)));
            }
        }
        );

        kendo.data.binders.widget.sourceex = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var data = this.bindings['sourceex'].get();
                data = data || [];
                var src = { dataSource: data || [] };
                if (this.element.dataSource)
                    this.element.dataSource.data(data)
                else this.element.setOptions($.extend(this.element.options, src));
            }
        });
        kendo.data.binders.widget.zoom = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
                element.bind(ZOOMCHANGE, $.proxy(this.change, this));
            },
            refresh: function () {
                var that = this,
                     value = that.bindings["zoom"].get(); //get the value from the View-Model
                that.element.setZoom(value);
            },
            change: function (v) {
                if (typeof v != 'number') return;
                this.bindings["zoom"].set(v);
            }
        });

        kendo.data.binders.widget.selected = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
                element.bind(CHANGE, $.proxy(this.change, this));
            },
            refresh: function () {
                var that = this,
                     value = that.bindings["selected"].get(); //get the value from the View-Model
                that.element.selected(value);
            },
            change: function (v) {
                this.bindings["selected"].set(v.selected);
            }
        });

        kendo.data.binders.widget.minValue = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var that = this,
                     value = that.bindings["minValue"].get(); //get the value from the View-Model
                that.element.minValue && that.element.minValue(value);
            }
        });

        kendo.data.binders.widget.min = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var that = this,
                     value = that.bindings["min"].get(); //get the value from the View-Model
                that.element.minValue && that.element.minValue(value);
            }
        });

        kendo.data.binders.widget.text = Binder.extend({
            init: function (element, bindings, options) {
                //call the base constructor            
                Binder.fn.init.call(this, element, bindings, options);
            },
            refresh: function () {
                var that = this,
                     value = that.bindings["text"].get(); //get the value from the View-Model
                that.element.setText && that.element.setText(value);
            },
            change: function (v) {
                this.bindings["text"].set(v);
            }
        });

        var parseDateString = function (data, key) {
            var parsed = null;
            try {
                if (data.hasOwnProperty(key))
                { parsed = new Date(Date.parse(data[key])); }

            } catch (e) { }
            return parsed;
        };

        var buildDatePickerEx = function () {
            return kendo.ui.DatePicker.extend({
                options: {
                    name: 'DatePickerEx'
                },
                minValue: function (val) {
                    if (val instanceof Date) {
                        var min = this.options.min || new Date;
                        if (min) {
                            if (min.getMonth() == val.getMonth && min.getDay() == val.getDay() && min.getYear() == val.getYear())
                                return;
                        }
                        var current = this.value();
                        this.setOptions($.extend(true, {}, this.options, { min: val }));

                        if (!this.element.val() || val > current) {
                            //val.setMinutes(24 * 60);
                            val.setHours(23, 59, 59, 999);
                            this.value(val);
                            /*Let MVVM bindings know that the value of the widget is changed*/
                            this.trigger(CHANGE, { value: val });
                        }
                    }
                },
                init: function (element, options) {
                    var data = $(element).data();
                    //Plain date string is not supported by DatePicker widget. Hence we are parsing to Date object
                    //string representation of Date is not supported by DatePicker,
                    //so here we are trying to parse the string value to Date object
                    data['min'] && (data['min'] = parseDateString(data, 'min'));
                    data['max'] && (data['max'] = parseDateString(data, 'max'));

                    //Merging options with current options and from data object.            
                    this.options = $.extend(this.options, options, data);
                    kendo.ui.DatePicker.fn.init.call(this, element, this.options);
                }
            });
        };

        var buildDateTimePicker = function () {
            return kendo.ui.DateTimePicker.extend({
                minValue: function (val) {
                    if (val instanceof Date) {
                        var min = this.options.min || new Date;
                        if (min) {
                            if (min.getMonth() == val.getMonth && min.getDay() == val.getDay() && min.getYear() == val.getYear() && min.getHours() == val.getHours() && min.getMinutes() == val.getMinutes() && min.getSeconds() == val.getSeconds())
                                return;
                        }
                        var current = this.value();
                        this.setOptions($.extend(true, {}, this.options, { min: val }));

                        if (!this.element.val() || val > current) {
                            //val.setMinutes(24 * 60);
                            this.value(val);
                        }
                    }
                },
                min: function (val) {
                    if (val instanceof Date) {
                        var min = this.options.min || new Date;
                        var current = this.value();
                        this.setOptions($.extend(true, {}, this.options, { min: val }));

                    }
                }

            });
        };

        var buildNumericTextBoxEx = function () {
            return kendo.ui.NumericTextBox.extend({
                minValue: function (val) {
                    if (isNaN(val)) return;
                    this.setOptions($.extend(true, {}, this.options, { min: val }));
                    var value = this.value();
                    if (_.isNumber(value)) {
                        if (value < val) {
                            value = val + this.options.step;
                            this._change(value);
                        }
                    }
                    else {
                        this._change(val);
                    }

                }

            });
        };
        var buildComboBoxEx = function () {
            var ComboBox = kendo.ui.ComboBox;

            return ComboBox.extend({
                _toBSelectedVal: '',
                init: function () {
                    ComboBox.fn.init.apply(this, arguments);
                    this._onDataChange = $.proxy(this._onDataChange, this);
                },
                selectValue: function (val) {
                    this.value(val);
                    this._toBSelectedVal = val;
                    this._typing = true;
                },
                /*_index: function (value) {
                    var that = this,
                        idx,
                        length,
                        data = that._data();
        
                    for (idx = 0, length = data.length; idx < length; idx++) {
                        var dv = that._dataValue(data[idx]) || '';
                        if (_.isString(dv) && that.options.ignoreCase && dv.toLowerCase() == value.toLowerCase()) return idx;
                        if (dv == value) {
                            return idx;
                        }
                    }
        
                    return -1;
                },*/
                _onDataChange: function (e) {
                    if (e.items.length && this._toBSelectedVal) {
                        this.value(this._toBSelectedVal);
                        setTimeout(function (me) {
                            me.close();
                        }, 200, this);
                        this._toBSelectedVal = '';
                    }
                },
                setOptions: function () {
                    ComboBox.fn.setOptions.apply(this, arguments);
                    this.dataSource.unbind('change', this._onDataChange);
                    this.dataSource.bind('change', this._onDataChange);
                }
            });
        };

        var buildFileReader = function (Upload) {
            var rFileExtension = /\.([^\.]+)$/;
            function inputFiles($input) {
                var input = $input[0];
                if (input.files) {
                    return getAllFileInfo(input.files);
                } else {
                    return [{
                        name: stripPath(input.value),
                        extension: getFileExtension(input.value),
                        size: null
                    }];
                }
            }

            function getAllFileInfo(rawFiles) {
                return $.map(rawFiles, function (file) {
                    return getFileInfo(file);
                });
            }

            function getFileInfo(rawFile) {
                // Older Firefox versions (before 3.6) use fileName and fileSize
                var fileName = rawFile.name || rawFile.fileName;
                return {
                    name: kendo.htmlEncode(fileName),
                    extension: getFileExtension(fileName),
                    size: rawFile.size || rawFile.fileSize,
                    rawFile: rawFile
                };
            }

            function getFileExtension(fileName) {
                var matches = fileName.match(rFileExtension);
                return matches ? matches[0] : "";
            }

            function stripPath(name) {
                var slashIndex = name.lastIndexOf("\\");
                return (slashIndex != -1) ? name.substr(slashIndex + 1) : name;
            }

            function assignGuidToFiles(files, unique) {
                var uid = kendo.guid();

                return $.map(files, function (file) {
                    file.uid = unique ? kendo.guid() : uid;

                    return file;
                });
            }

            function isFileTypeSupported(fileName, supportedTypes) {
                var fileExtension = getFileExtension(fileName),
                    supportedTypeList = supportedTypes.split(','),
                    isValid = false;

                $.each(supportedTypeList, function (idx, type) {
                    if (type.toLowerCase() === fileExtension.toLowerCase()) {
                        isValid = true;
                        return false;
                    }
                });
                return isValid;
            }

            return Upload.extend({
                init: function (element, options) {
                    Upload.fn.init.call(this, element, options);
                    this.setConfig({ type: '.xml' });
                },
                _read: function (files) {
                    var that = this;
                    var loadEnd = function (e) {
                        that.content(e.target.result);
                        that.trigger('contentLoaded', { content: e.target.result, fileName: files[0].name });
                    };
                    if (files.length == 0) return;
                    var file = files[0];
                    var reader = new FileReader();
                    reader.removeEventListener('loadend', loadEnd, true);
                    reader.addEventListener('loadend', loadEnd, true);
                    reader[that.config.readFileAs || 'readAsText'](file);
                },
                _onInputChange: function (e) {
                    var upload = this,
                        input = $(e.target), files = inputFiles(input), prevented = false;
                    //prevented = this.config.type.indexOf(files[0].extension) > -1 ? upload.trigger('select', { files: files }) : true;

                    if (!upload.config.disableFileTypeValidation && !isFileTypeSupported(files[0].name, upload.config.type)) {
                        prevented = true;
                    };
                    if (prevented) {
                        upload._addInput(input);
                        input.remove();
                        upload.wrapper.addClass('k-upload-empty').find('.k-upload-files').remove();
                    } else {
                        var files = assignGuidToFiles(upload._inputFiles(input), upload._isAsyncNonBatch());
                        upload._module.onSelect(e, files);
                        upload._read(e.target.files);
                    }
                },
                setConfig: function (val, silent) {
                    this.config = val;
                    //if (!silent) this.trigger(CONFIGCHANGE, val);
                    (!silent) && this.trigger(CHANGE, { field: 'config' });
                },
                options: {
                    name: 'fileReader',
                    autoUpload: false,
                    multiple: false,
                    localization: {
                        "select": "Select File"
                    },
                    readFileAs: 'readAsBinaryString'
                },
                value: function (value) {
                    this.element.value = value;
                },
                content: function (val) {
                    this.trigger(CONTENTCHANGE, val);
                },
                // events are used by other widgets / developers - API for other purposes
                // these events support MVVM bound items in the template. for loose coupling with MVVM.
                events: [
                    // call before mutating DOM.
                    // mvvm will traverse DOM, unbind any bound elements or widgets
                    DATABINDING,
                    // call after mutating DOM
                    // traverses DOM and binds ALL THE THINGS
                    DATABOUND,
                    CONTENTCHANGE, CONFIGCHANGE,
                    'contentLoaded'
                ]
            })
        }, FileReaderWidget = buildFileReader(kendo.ui.Upload);
        var inPlaceEditor = Widget.extend({
            $editor: null, $element: null, element: null,
            options: {
                name: 'inplaceeditor'
            },
            events: [CHANGE],
            init: function (element, options) {
                var $element = this.element = this.$element = $(element);
                this._dbClick = $.proxy(this._dbClick, this);
                this._onKeyUp = $.proxy(this._onKeyUp, this);
                this._updateHide = $.proxy(this._updateHide, this);
                this.refresh();
                Widget.fn.init.apply(this, arguments);
            },
            value: function (text) {
                if (text) {
                    this.setText(text);
                    return;
                }
                return this.$editor.val();
            },
            setText: function (text) {
                var t = this;
                text = text || '';
                t.$element.text(text);
                t.$editor.val(text);
            },
            refresh: function () {
                var $element = this.$element, _editorId = $element.data('editor-id');
                if (_editorId) $('[id="' + _editorId + '"]').remove();
                else {
                    _editorId = kendo.guid();
                    $element.data('editor-id', _editorId);
                }
                this.$editor = $(kendo.format('<input type="text" data- class="{0}" value="{1}" id="{2}"/>', $element.attr('class') + ' inplace-editor', $element.text(), _editorId));
                this.$editor.hide();
                $element.siblings('.inplace-editor').remove();
                this.$editor.insertAfter($element);
                utils.invokeAsync(function () {
                    //this.$element.off('click', this._dbClick);
                    this.$element.off('dblclick', this._dbClick);
                    this.$editor.off('keyup', this._onKeyUp);
                    this.$editor.off('focusout', this._updateHide);
                    //this.$element.on('click', this._dbClick);
                    this.$element.on('dblclick', this._dbClick);
                    this.$editor.on('keyup', this._onKeyUp);
                    this.$editor.on('focusout', this._updateHide);
                }, this);
            },
            _dbClick: function (e) {
                e.preventDefault();
                this.$element.hide();
                this.$editor.show();
                var val = this.$editor.val();
                (!val) && this.setText(this.$element.text());
                this.$editor.focus();
                return false;
            },
            _updateHide: function () {
                if (this.$editor.val()) { this.$element.text(this.$editor.val()); this._triggerChange(); }
                this.$element.show(), this.$editor.hide();
            },
            destroy: function () {
                this.$editor.remove();
            },
            _triggerChange: function () {
                this.$element.trigger('change', this.$element.text());
                this.trigger('change', { field: 'value' });
            },
            _onKeyUp: function (e) {
                e.keyCode == 13 && this._updateHide();
            }
        });
        var tooltipEx = kendo.ui.Tooltip.extend({
            $editor: null, $element: null,
            options: {
                name: 'TooltipEx', content: function (e) { return e.target.find('.tooltip-content').html(); }
            }
        });
        var ButtonsExtender = Widget.extend({
            $more: null, $element: null, _config: null,
            options: {
                name: 'ButtonsExtender'
            },
            init: function (element, options) {
                var $element = this.$element = $(element);
                this.setConfig(options);
                this._moreClick = $.proxy(this._moreClick, this);
                this.$element.on('click', '>[data-more-button=true]', this._moreClick);
                Widget.fn.init.call(this, arguments);
            },
            setConfig: function (opt) {
                this._config = $.extend({ maxButtons: 2 }, opt);
                this.refresh();
            },
            refresh: function () {
                var $element = this.$element;
                this.$more = $element.find('>[data-more-button=true]');
                this.$more.remove();
                var $btns = $element.find('.k-button').not('[data-visibletoextend=false]');
                if ($btns.length > this._config.maxButtons) {
                    _.each($btns.slice(this._config.maxButtons), function (elt) {
                        var $elt = $(elt);
                        $elt.hide();
                    });
                    this.$more.insertAfter($element.find('>.k-button:last'));
                }
            },
            _moreClick: function (e) {
                e.preventDefault();
                this.$more.remove();
                _.each(this.$element.find('.k-button').not('[data-visibletoextend=false]').slice(this._config.MaxButtons), function (elt) {
                    var $elt = $(elt);
                    $elt.css('display', 'inline-block');
                    kendo.fx($elt).slideIn("left").play();
                });
            }
        });

        var extendKendoButton = function () {
            var initFn = kendo.ui.Button.fn.init;
            /*Added "cssMutation" option to control the button from adding k-button class*/
            return kendo.ui.Button.extend({
                options: { cssMutation: true },
                init: function () {
                    initFn.apply(this, arguments);
                    !this.options.cssMutation && this.element.removeClass('k-button');
                }
            });
        };

        var extendKendoRichTextEditor = function () {

            /*By default enabled all the options available for RichText Editor*/
            var editor = kendo.ui.Editor, defaultTools = editor.defaultTools;
            var editorEx = editor.extend({
                options: {
                    tools: ["bold", "italic", "underline", "strikethrough", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "insertUnorderedList", "insertOrderedList", "indent", "outdent", "createLink", "unlink", "insertImage", "subscript", "superscript", "createTable", "addRowAbove", "addRowBelow", "addColumnLeft", "addColumnRight", "deleteRow", "deleteColumn", "viewHtml", "formatting", "fontName", "fontSize", "foreColor", "backColor"]
                }
            });
            editorEx.defaultTools = defaultTools;
            return editorEx;
        };

        var buildPageSlide = function () {

            return Widget.extend({
                options: { name: 'PageSlide', autoOpen: false, html: false, iframe: false, direction: 'left', speed: 200, modal: false, href: null },
                $element: null,
                events: ['open', 'close'],
                init: function (element, options) {
                    Widget.fn.init.apply(this, arguments);
                    this.$element = $(element);
                    this.$element.pageslide(this.options);
                    this.$element.on('pageslide.open', $.proxy(this._onOpen, this));
                    this.$element.on('pageslide.close', $.proxy(this._onClose, this));
                    utils.invokeAsync(function () { (this.options.autoOpen) && this.$element.trigger('click'); }, this, null, 200);
                }, _onOpen: function () {
                    this.trigger('open');
                }, _onClose: function () {
                    this.trigger('close');
                }
            });
        };

        var multiComboListPlugin = function () {
            return kendo.ui.MultiSelect.extend({
                options: {
                    name: 'MultiComboList'
                },
                init: function (element, options) {
                    options = options || {};
                    //options.dataTextField = 'Value';
                    //options.dataValueField = 'Value';
                    options.autoBind = false;

                    kendo.ui.MultiSelect.fn.init.call(this, element, options);
                    this._initialValues = [];
                },
                _keydown: function (e) {
                    var that = this,
                        posKeys = [13, 32, 186, 188];

                    if (posKeys.indexOf(e.keyCode) > -1) {
                        var value = this.input.val(),
                            newItem = {};

                        newItem[that.options.dataValueField] = value;

                        value && this.value([newItem]);
                        e.preventDefault();
                    }
                    else {
                        this._scale();
                    };
                },
                value: function (value) {
                    var that = this;
                    if (value) {
                        if ($.isArray(value)) {
                            $.each(value, function (index, item) {
                                var newItem = {},
                                    selectedItems = that._dataItems.slice();

                                if (_.isString(item)) {
                                    var temp = {};
                                    temp[that.options.dataValueField] = item;
                                    item = temp;
                                };

                                newItem[that.options.dataValueField] = that._value(item);

                                !_.findWhere(that.dataSource._data, newItem) && that.dataSource._data.push(newItem);
                                kendo.ui.MultiSelect.fn.value.call(that, that.dataSource._data.slice());
                                !_.findWhere(selectedItems, newItem) && selectedItems.push(newItem);

                                $.each(selectedItems, function (selectedIndex, selectedItem) {
                                    $.each(that.dataSource._data.slice(), function (idx) {
                                        if (that._value(this) === that._value(selectedItem)) {
                                            that._select(idx);
                                            that._change();
                                            return false;
                                        };
                                    });
                                });
                            });
                        };
                    }
                    else {
                        return kendo.ui.MultiSelect.fn.value.call(that);
                    };
                }
            });
        };

        /*
        DataSource component is extended here to make asynchronous parsing of response feasible
        */
        var extentDataSource = function () {
            var originalDataSource = kendo.data.DataSource;
            originalDataSource.prototype._afterParsed = function (data) {
                var that = this;
                if (that._handleCustomErrors(data)) {
                    that._dequeueRequest();
                    return;
                }

                that._total = that.reader.total(data);
                that._pristineTotal = that._total;

                if (that._aggregate && options.serverAggregates) {
                    that._aggregateResult = that.reader.aggregates(data);
                }

                data = that._readData(data);

                that._pristineData = data.slice(0);

                that._data = that._observe(data);

                that._addRange(that._data);

                that._process(that._data);
                that._dequeueRequest();
            };
            originalDataSource.prototype.success = function (data) {
                var that = this,
                    options = that.options;

                that.trigger('requestEnd', { response: data, type: "read" });

                if (that.reader.parseAsync) {
                    data = that.reader.parseAsync(data, $.proxy(this._afterParsed, this));
                }
                else {
                    data = that.reader.parse(data);
                    this._afterParsed(data);
                }
            };

        },
        /*Extend kendo.ui.Popup to give a chance to the framework for initializing the custom scroll*/
        extendPopup = function () {
            var originalPopup = kendo.ui.Popup;
            return originalPopup.extend({
                open: function () {
                    originalPopup.fn.open.apply(this, arguments);
                    this.options.anchor.trigger('createScroll', this);
                }
            });
        };

        extentDataSource();
        kendo.ui.plugin(extendPopup());
        kendo.ui.plugin(extendKendoRichTextEditor());
        kendo.ui.plugin(extendKendoButton());
        kendo.ui.plugin(tooltipEx);
        kendo.ui.plugin(ButtonsExtender);
        kendo.ui.plugin(inPlaceEditor);
        kendo.ui.plugin(FileReaderWidget);
        kendo.ui.plugin(buildNumericTextBoxEx());
        kendo.ui.plugin(buildDatePickerEx());
        kendo.ui.plugin(buildDateTimePicker());
        kendo.ui.plugin(buildComboBoxEx());
        kendo.ui.plugin(buildPageSlide());
        kendo.ui.plugin(kendoCM);
        kendo.ui.plugin(multiComboListPlugin());
    });