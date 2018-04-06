
define(

    [],

    function () {

        'use strict';

        var AP;

        var AgilePointViewModelDependantMethods = function (AgilePoint) {

            AP = AgilePoint;
        };

        AgilePointViewModelDependantMethods.prototype.ViewModelMethods = {

            // i18n key translation 
            translate: function (EncodedParam, Values) {

                var C = this.get('State.Data.culture'), // Hook culture changes
                    Key = AP.Utils.decodeParam(EncodedParam),
                    KeyTranslated = AP.View.Internationalize.translate(Key, Values); // hook binding

                return KeyTranslated;
            },

            // Translation of images fields with a i18n key
            translateImagePath: function (EncodedParam, Values) {

                var KeyTranslated = this.translate(EncodedParam, Values),
                    ImagePath = AP.Config.Data.RootPath + 'resources/img/' + KeyTranslated;

                return ImagePath;
            },

            // Translation of style image fields with a i18n key
            translateStyleImagePath: function (EncodedParam, Values) {

                var KeyTranslated = this.translateImagePath(EncodedParam, Values),
                    StyleImagePath = 'url(' + KeyTranslated + ')';

                return StyleImagePath;
            },

            // render block fields list
            renderFields: function (BlockId) {

                var Block = this.get('Blocks.' + BlockId),
                    FieldsPath = 'Blocks.' + BlockId + '.Fields',
                    Fields = this.get(FieldsPath),
                    FieldsHTML = '';

                if (Fields && Fields.length > 0) {

                    for (var f = 0; f < Fields.length; f++) {

                        FieldsHTML += AP.View.Templates.renderTemplate('field', {
                            BlockId: BlockId,
                            Index: f,
                            Field: Fields[f]
                        });
                    };
                };

                return FieldsHTML;
            },

            interfaceStates: function () {

                var InterfaceStateList = this.get('State.Interface'),
                    InterfaceState = InterfaceStateList.join(' ');

                return InterfaceState;
            },
            SectionTitle: '',
            getBreadCrumbs: function () {

                var Path = this.get('State.Data.navigationpath') || '',
                    PathArray = AP.Config.getBreadCrumbsPath(Path).split('/'),
                    PathArray = _.without(PathArray, 'sections'),
                Separator = AP.View.Templates.renderTemplate('widget/breadcrumbs/breadcrumbseparator');
                //(PathArray.length > 1) && (PathArray = PathArray.slice(0, PathArray.length - 1));
                var BreadCrumbsArray = _.map(PathArray, function (Step) {

                    if (Step == '') return Step;

                    Step = 'breadcrumbs.' + Step; // Translation slot
                    return AP.View.Internationalize.translate(Step);
                }).filter(function (item) {
                    return item && item.length > 0;
                });
                var title = BreadCrumbsArray.join(Separator);
                //var title = _.first(BreadCrumbsArray);
                title && this.set('SectionTitle', title);
                return title;
            }
        };

        AgilePointViewModelDependantMethods.prototype.QueryModelMethods = {

            getFields: function () {

                var FieldsList = [],
                    Fields = this.get('fields');

                for (var f in Fields) {
                    FieldsList.push({
                        Name: f,
                        Field: Fields[f]
                    });
                }
                return FieldsList;
            }
        };

        return AgilePointViewModelDependantMethods;
    }
);
