
define(

    [],

    function () {

        'use strict';

        var AP;

        var AgilePointModelDataSource = function (AgilePoint) {

            AP = AgilePoint; // Make available application namespace
        };

        // Calculate a kendo datasource from App Query
        AgilePointModelDataSource.prototype.getDataSource = function (Query, ExtraData) {

            var ExtraData = ExtraData || {},
                QueryDataForm = Query.Form || {}, // Data for form rendering
                // Flatten data for DataSource query
                QueryDataForDataSource = Query.generateQuery ? Query.generateQuery(ExtraData) : {}, //this.adaptQueryDataForDataSource(QueryDataForm),
                //QueryDataForDataSource = $.extend(true, QueryDataForDataSource, ExtraData),
                // Generic DataSource config for the app
                AppDataSource = AP.Config.DataSource(Query, QueryDataForDataSource),
                // DataSource config specific for this query
                QueryDataSource = Query.DataSource || {}, // DataSource config specific for query
                // Extra functionality
                ExtraDataSource = {
                    schema: {
                        AP: AP // AP reference for parse data	
                    }
                };

            AppDataSource = $.extend(true, {}, AppDataSource, QueryDataSource, ExtraDataSource);

            var DataSource = {
                QueryData: QueryDataForDataSource, // Query fields used in widgets display (title, etc)
                DataSource: AppDataSource
            };

            return DataSource;
        };

        AgilePointModelDataSource.prototype.getDataFromFields = function (Fields, initialData) {
            initialData = initialData || {};
            _.each(Fields, function (Field, Key) {

                initialData[Field.fieldName || Key] = Field.defaultValue;
            });
            return initialData;
        };

        AgilePointModelDataSource.prototype.adaptQueryDataForDataSource = function (QueryDataForm) {

            var me = this, Data = {};

            //Flat Form structure
            if (QueryDataForm) {
                _.each(QueryDataForm.SubForms, function (SubForm) {

                    _.each(SubForm.FieldSets, function (FieldSet) {

                        Data = me.getDataFromFields(FieldSet.Fields, Data);

                    });
                });
            }
            return Data;
        };

        return AgilePointModelDataSource;
    }
);
