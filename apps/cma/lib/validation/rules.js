
define(
    ['kendo'// Kendo Libs
    ],

    function (K) {
        return function (AP) {
            var translateLocalKey = function (key) {
                return AP.View.Internationalize.translate(key);
            };
            var rule = kendo.Class.extend({
                name: '', kendoWidgetEnum: {
                    'multiselect': {
                        name: 'kendoMultiSelect', getAssociatedData: function ($inp) {
                            var multiselect = $inp.data("kendoMultiSelect"); return multiselect.dataItems();
                        }
                    }
                },
                init: function (cfg) {
                    cfg = cfg || {};
                    this.message = cfg.message || this.message;
                    this.onInit.call(this, cfg);
                },
                onInit: function () {

                },
                message: function (input) { return ''; },
                handler: null,
                isActive: function (input) {
                    var enabledRules = input.data('rules');
                    return (enabledRules && enabledRules.indexOf(this.name) > -1);
                },
                getHandler: function () {
                    return $.proxy(this.handler, this);
                },
                serializeToKendoWidget: function ($inp) {
                    var datarole = $inp.data('role');

                    if (this.kendoWidgetEnum[datarole]) {
                        return this.kendoWidgetEnum[datarole].getAssociatedData($inp);
                    }
                    else {

                        return [];
                    }
                }
            });

            var rules = new Object();

            rules['atl1required'] = rule.extend({
                onInit: function (cfg) {
                    this.minlength = cfg.minlength || 3;
                    this.atleast1Rqd = cfg.atleast1Rqd === undefined ? true : cfg.atleast1Rqd;
                },
                minlength: 3,
                name: 'atl1required',
                message: function (input) { return translateLocalKey('validation.msgs.atl1required') || 'Enter at least 3 characters in any one of the fields'; },
                handler: function (input) {
                    if (input.is(':radio') || input.is(':checkbox') || input.is('textarea') || input.is('[data-validate=false]') || input.is('[role=\'combobox\']') || input.is('[data-role=\'multiselect\']') || input.is('[data-role=\'numerictextbox\']') || input.is('.skip-rules') || input.is('[type=hidden]') || input.is('[data-rules=\'requiredCombo\']')) return true;
                    var $inputs = input.closest('form').find('input[type=text],input[type=email],input[type=password], input[data-rules=atl1required]')
                        .not(':radio,:checkbox,:disabled,[data-validate=false],textarea,[data-role=\'dropdownlist\'],[data-role=\'numerictextbox\']');
                    var me = this;
                    var res = false;
                    if (this.atleast1Rqd) {
                        $inputs.each(function () {
                            var $inp = $(this);
                            var skipRules = $inp.data('skip-rules');
                            if (skipRules && skipRules.indexOf('atl1required') > -1)
                                return res = true;
                            if ($inp.is('[type=text]') || $inp.is('[type=email]') || $inp.is('[type=password]'))
                                $inp.val().length >= me.minlength ? res = true : '';
                            else {
                                var dataItems = me.serializeToKendoWidget($inp);
                                dataItems.length > 0 ? res = true : '';
                            }
                        });
                        return $inputs.length == 0 ? true : $inputs.length == 1 ? $inputs.val().length >= 2 : res;
                    } else {
                        var skipRules = input.data('skip-rules');
                        if (skipRules && skipRules.indexOf('atl1required') > -1)
                            return res = true;
                        if (input.val().length == 0) {
                            return res = true;
                        }
                        else {
                            return res = input.val().length >= me.minlength;
                        }
                    }
                }
            });
            rules['ascradio'] = rule.extend({
                name: 'ascradio',
                minlength: 2,
                message: function (input) { return translateLocalKey('validation.msgs.ascradio') || 'Please enter value'; },
                handler: function (input) {
                    var me = this, res = false, $inp = null;
                    var exp = '[data-associated="' + input.attr('name') + '"]';
                    if (input.siblings(exp).is(':radio:checked') || input.siblings().find(exp).is(':radio:checked'))
                        return input.val().length >= me.minlength;
                    return true;
                }
            });



            //rules['atl3character'] = rule.extend({
            //    onInit: function (cfg) {
            //        this.minlength = cfg.minlength || 3;
            //    },
            //    minlength: 3,
            //    name: 'atl3character',
            //    message: function (input) { return 'Enter atleast 3 characters'; },
            //    handler: function (input, kv) {
            //        var me = this, res = false;
            //        var me = this;
            //        if (input.is('[data-role=\'combobox\']')) {
            //            var $inputs = input.closest('form').find('[data-role=\'combobox\']');
            //            $inputs.each(function () {
            //                var $inp = $(this);
            //                var skipRules = $inp.data('skip-rules');
            //                if (skipRules && skipRules.indexOf('atl3character') > -1)
            //                    return res = true;
            //                return res = $inp.val().length < me.minlength;
            //            });
            //            return !res;
            //        }

            //        return true;
            //    }
            //});
            rules['requiredCombo'] = rule.extend({
                name: 'requiredCombo',
                message: function (input) { return translateLocalKey('validation.msgs.requiredCombo') || 'Please select a value'; },
                handler: function (input) {
                    var cb, me = this, sel = '[data-role=\'combobox\']';
                    //input = input.parent().siblings(sel);
                    if (me.isActive(input)) {
                        cb = input.data('kendoComboBox');
                        var hasVal = cb ? cb.value().length > 0 : input.val().length > 0;
                        if (input.is('[required]'))
                            return cb ? cb.selectedIndex > -1 : hasVal;
                        else {
                            return cb ? cb.value().length > 0 ? cb.selectedIndex > -1 : true : true;
                        }
                    }
                    return true;
                }
            });

            rules['requiredDropDown'] = rule.extend({
                name: 'requiredDropDown',
                message: function (input) { return translateLocalKey('validation.msgs.requiredDropDown') || 'Please select a value'; },
                handler: function (input) {

                    var cb, me = this, sel = '[data-role=\'dropdownlist\']';
                    if (me.isActive(input)) {
                        if (input.is('[data-role=dropdownlist]')) {
                            var dropdown = input.data("kendoDropDownList");
                            return dropdown.selectedIndex > 0;
                        }
                    }

                    return true;
                }
            });

            rules['daterequired'] = rule.extend({
                name: 'daterequired',
                message: function (input) { return translateLocalKey('validation.msgs.daterequired') || 'Select a date'; },
                handler: function (input) {
                    var me = this, res = false, $inp = null;

                    var validateDate = function (inp, widgt) {
                        var dt = inp.data(widgt);
                        return _.isDate(dt.value());
                    }

                    if (input.is('[data-role=datetimepicker]')) {
                        return validateDate(input, 'kendoDateTimePicker')
                    }
                    else if (input.is('[data-role=datepicker]') || input.is('[data-role=datepickerex]')) {
                        return validateDate(input, 'kendoDatePickerEx');
                    }
                    return true;
                }
            });

            rules['regexValidationforFilePath'] = rule.extend({
                name: 'regexValidationforFilePath',
                message: function (input) { return translateLocalKey('validation.msgs.regexValidationforFilePath') || 'Please provide valid file path, eg. C:\\User\\Document\\Foldername'; },
                handler: function (input) {
                    var val, me = this, res = true,
                        //regex = /^(?:[a-zA-Z]\:|\\\\[\w\.\s]+(\/|\\)[\w.$\s]+)(\/|\\)(?:[\w\s]+(\/|\\))*\w([\w.\s])+$/;
                        regex = /^([^\x00-\x7F]:|[A-Za-z]:)((\/|\\|\\\\)([^\x00-\x7F]|[A-Za-z_\-\s0-9\.])+)+$/;
                    if (input.is('[type=text]')) {
                        val = input.val();
                        if (me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                    }
                    return true;
                }
            });

            rules['regexValidationforDomainPath'] = rule.extend({
                name: 'regexValidationforDomainPath',
                message: function (input) { return translateLocalKey('validation.msgs.regexValidationforDomainPath') || 'Please provide valid domain path, eg. LDAP://DC=SPSTD,DC=LOC'; },
                handler: function (input) {
                    var val, me = this, res = true,
                        //regex = /^(LDAP\:\/\/)+[a-zA-Z=,\.]{3,50}$/;
                        regex = /(?:ldap)s|(?:WinNT)?:\/\/(?:(?!.*\d[\/?:])[a-z0-9\-._~%]+|(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\[[a-z0-9\-._~%!$&'()*+,;=:]+\])(?::\d+)?(?:[\/?][\-A-Z0-9+&@#\/%?=~_|$!:,.;]*)?/i;
                    if (input.is('[type=text]')) {
                        val = input.val().trim();
                        if (me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                    }
                    return true;
                }
            });


            //Name Validation for atleast one alphabet

            rules['regexValidationforName'] = rule.extend({
                name: 'regexValidationforName',
                message: function (input) { return translateLocalKey('validation.msgs.regexValidationforName') || 'Enter atleast one alphabet'; },
                handler: function (input) {
                    var val, me = this, res = true,
                        regex = /^(?=.*[a-zA-Z]|[^\x00-\x7F]).+$/;
                    if (input.is('[type=text]')) {
                        val = input.val().trim();
                        if (me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                    }
                    return true;
                }
            });


            rules['regexValidationforDataBasePath'] = rule.extend({
                name: 'regexValidationforDataBasePath',
                message: function (input) { return translateLocalKey('validation.msgs.regexValidationforDataBasePath') || 'Provide valid connection string'; },
                handler: function (input) {
                    var val, me = this, res = true, regex = /^([^=;]+=[^=;]*)(;[^=;]+=[^=;]*)*;?$/;
                    if (input.is('textarea')) {
                        val = input.val().trim();
                        if (me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                    }
                    return true;
                }
            });

            rules['regexMin3CharValidation'] = rule.extend({
                name: 'regexMin3CharValidation',
                message: function (input) { return translateLocalKey('validation.msgs.atl3character') || 'Enter atleast 3 characters'; },
                handler: function (input) {
                    var val, me = this, res = true;
                    if (input.is('[type = text]')) {
                        if (me.isActive(input)) {
                            val = input.val().trim();
                            val.length >= 3 ? input.removeAttr('validationMessage') : input.attr('validationMessage', me.message);
                            return val.length >= 3;
                        }
                    }
                    return true;
                }
            });

            rules['regexValidationForEmail'] = rule.extend({
                name: 'regexValidationForEmail',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForEmail') || 'Invalid Email';
                },
                handler: function (input) {
                    var val, me = this, res = true, regex = /^([a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,6}|\${+[a-zA-Z]+})(,\s[a-zA-Z0-9._]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,6}|,\s\${+[a-zA-Z]+}+)*$/;
                    if (input.is('[type = text][data-rules=regexValidationForEmail]')) {
                        val = input.val().trim();
                        if (me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }

                    }
                    return true;
                }
            });

            rules['regexValidationForWebAddress'] = rule.extend({
                name: 'regexValidationForWebAddress',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForWebAddress') || 'Invalid Web Address';
                },
                handler: function (input) {
                    var val, me = this, res = true, regex = /^(http[s]?:\/\/(www\\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+((\.[a-zA-Z]{2,3})+)(\/(.)*)?(\?(.)*)?/;
                    if (input.is('[type = text][data-rules=regexValidationForWebAddress]')) {
                        val = input.val().trim();
                        if (val && me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                        else {
                            return true;
                        }

                    }
                    return true;
                }
            });

            rules['regexValidationForServerUrl'] = rule.extend({
                name: 'regexValidationForServerUrl',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForWebAddress') || 'Invalid Web Address';
                },
                handler: function (input, kv) {
                    var val, me = this, res = true, regex = /^(http[s]?:\/\/(www\\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+/;
                    if (input.is('[type = text][data-rules=regexValidationForServerUrl]')) {
                        val = input.val().trim();
                        if (val && me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                        else {
                            return true;
                        }

                    }
                    return true;
                }
            });

            rules['regexValidationForAndroidPackageName'] = rule.extend({
                name: 'regexValidationForAndroidPackageName',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForAndroidPackageName') || 'Invalid Package Name';
                },
                handler: function (input, kv) {
                    var val, me = this, res = true, regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/i;
                    if (input.is('[type = text][data-rules=regexValidationForAndroidPackageName]')) {
                        val = input.val().trim();
                        if (val && me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        }
                        else {
                            return true;
                        }

                    }
                    return true;
                }
            });

            rules['regexValidationForSpecialChars'] = rule.extend({
                name: 'regexValidationForSpecialChars',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForSpecialChars') || 'Special characters <>&" are not allowed.';
                },
                handler: function (input, kv) {
                    var val, me = this, res = true, regex = /^[^<>&"]*$/;
                    if (input.is('[type = text][data-rules=regexValidationForSpecialChars]')) {
                        val = input.val().trim();
                        if (val && me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        };
                    };
                    return true;
                }
            });

            rules['regexValidationForPublisherName'] = rule.extend({
                name: 'regexValidationForPublisherName',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForPublisherName') || 'Invalid Publisher Id.';
                },
                handler: function (input, kv) {
                    var val, me = this, res = true, regex = /(CN|L|O|OU|E|C|S|STREET|T|G|I|SN|DC|SERIALNUMBER|(OID\.(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))+))=(([^,+="<>#;])+|".*")(, ((CN|L|O|OU|E|C|S|STREET|T|G|I|SN|DC|SERIALNUMBER|(OID\.(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))+))=(([^,+="<>#;])+|".*")))*/;
                    if (input.is('[type = text][data-rules=regexValidationForPublisherName]') && AP.Config.loadQuery('CMAAddOrEditApp').get('Form.StoreCertificate.WindowsCertificate.isPublisherFieldsRequired()')) {
                        val = input.val().trim();
                        if (val && me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        };
                    };
                    return true;
                }
            });

            rules['regexValidationForPhonePublisherId'] = rule.extend({
                name: 'regexValidationForPhonePublisherId',
                message: function (input) {
                    return translateLocalKey('validation.msgs.regexValidationForPhonePublisherId') || 'Invalid Phone Publisher Id.';
                },
                handler: function (input, kv) {
                    var val, me = this, res = true, regex = /(^([0-9A-Fa-f]{8}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{12})$)/;
                    if (input.is('[type = text][data-rules=regexValidationForPhonePublisherId]') && AP.Config.loadQuery('CMAAddOrEditApp').get('Form.StoreCertificate.WindowsCertificate.isPublisherFieldsRequired()')) {
                        val = input.val().trim();
                        if (val && me.isActive(input)) {
                            regex.test(val) ? input.removeAttr('validationmessage') : input.attr('validationMessage', me.message);
                            return regex.test(val);
                        };
                    };
                    return true;
                }
            });

            return rules
        };
    });