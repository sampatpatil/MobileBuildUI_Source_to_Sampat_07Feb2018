
define(['kendo'], function () {

    var andOP = ' and ', orOP = ' or ', inOP = ' in ', eqOP = ' = ', neqOP = ' <> ', ltOP = ' < ', gtOP = ' > ', ltEqOP = ' <= ', gtEqOP = ' >= ', betwOP = ' between ',
    selectOP = 'select ', fromOP = ' from ', LOJ = ' left outer join ', ROJ = ' right outer join ', IJ = ' inner join ', LIJ = ' left inner join ', RIJ = ' right inner join ',
    ORDERBY = ' order by ', GROUPBY = ' group by ', ASC = ' asc ', DESC = ' desc ', WHERE = ' where ', LIKE = ' like ', ON = ' on ';

    var concat = function () {
        return ''.concat.apply('', arguments);
    };

    var returnthisIf = function (predicate, value) {
        return predicate && predicate() === true ? value : '';
    };

    var concatArray = function (list, array, itemSep, startIndex, skipFirstItemSep) {
        list = list || [];
        itemSep = itemSep == null ? ',' : itemSep;
        if (array.length <= startIndex) return list;
        var sepPushed = 0;
        for (var i = startIndex || 0; i < array.length; i++) {
            list.push(array[i]);
            if (i < array.length - 1) {
                if (sepPushed == 0 && skipFirstItemSep) continue;
                list.push(itemSep); sepPushed++;
            }
        }
        return list;
    }

    var queryBuilder = function (tableName) {
        var _q = '', me = this, _selectQ = '', _fromQ = '', _whereQ = '';

        me.get = function () { return concat(_fromQ, _q); };



        var basicQPredicate = function () { return _q.length > 0; };

        me.select = function () {
            var concatList = concatArray([selectOP], arguments, '');
            concatList.push(fromOP);
            var lfq = concat.apply(me, concatList);
            return {
                from: function () {

                    var concatList = concatArray([lfq], arguments, ' , ', 0, true);
                    lfq = concat.apply('', concatList), j = function (type, table) {
                        var q = concat(type, table);
                        return {
                            on: function (left, op, right) {
                                lfq = concat(lfq, q, ON, left, op, right);
                                return extns;
                            }
                        };
                    };
                    var extns = {
                        loj: function (table) {
                            return j(LOJ, table);
                        },
                        roj: function (table) {
                            return j(ROJ, table);
                        },
                        ij: function (table) {
                            return j(IJ, table);
                        },
                        lij: function (table) {
                            return j(LIJ, table);
                        },
                        rij: function (table) {
                            return j(RIJ, table);
                        },
                        then: function () { _fromQ = lfq; return me; }
                    };


                    return extns;
                }
            }
        };

        me.where = function () {
            _q = concat(WHERE, _q);
            return me;
        }

        me.like = function (left, right, format, skipParse) {
            _q = conditional(left, LIKE, parseValue(concat('%', right, '%'), format, skipParse));
            return me;
        }

        me.and = function () {
            _q = concat(_q, returnthisIf(basicQPredicate, andOP));
            return me;
        };

        me.or = function () {
            _q = concat(_q, returnthisIf(basicQPredicate, orOP));
            return me;
        };

        var conditional = function (left, operator, right) {
            return tableName ? concat(_q, tableName, '.', left, operator, right) : concat(_q, left, operator, right);
        };

        me.conditional = function () {
            _q = conditional.apply(me, arguments);
            return me;
        };

        me.eq = function (left, right, format, skipParse) {
            _q = conditional(left, eqOP, parseValue(right, format, skipParse));
            return me;
        };

        me.neq = function (left, right, format, skipParse) {
            _q = conditional(left, neqOP, parseValue(right, format, skipParse));
            return me;
        };

        var parseValue = function (value, format, skip) {
            skip = skip || false;
            if (skip) return value;
            if (value instanceof String || typeof value == 'string')
                return kendo.format("'{0}'", kendo.toString(value.replace("'", "''"), format));

            if (value instanceof Date)
                return kendo.format("CONVERT(datetime,'{0}',20)", kendo.toString(value, format));

            return value;

        };

        me.gt = function (left, right, format, skipParse) {
            _q = conditional(left, gtOP, parseValue(right, format, skipParse));
            return me;
        };

        me.gtOrEq = function (left, right, format, skipParse) {
            _q = conditional(left, gtEqOP, parseValue(right, format, skipParse));
            return me;
        };


        me.lt = function (left, right, format, skipParse) {
            _q = conditional(left, ltOP, parseValue(right, format, skipParse));
            return me;
        };

        me.ltOrEq = function (left, right, format, skipParse) {
            _q = conditional(left, ltEqOP, parseValue(right, format, skipParse));
            return me;
        };

        me.groupby = function (cols) {
            _q = concat(_q, GROUPBY, cols);
            return me;
        }

        me.orderby = function (col) {
            var oQ = concat(ORDERBY, col);
            return { asc: function () { _q = concat(_q, oQ, ASC); return me; }, desc: function () { _q = concat(_q, oQ, DESC); return me; } };
        }

        me.cast = function (column) {
            var localQ = tableName ? concat('CAST(', tableName, '.', column) : concat('CAST(', column);
            return {
                as: function (typeName) {
                    _q = concat(_q, localQ, ' as ', typeName, ')');
                    return me;
                }
            };
        };

        me.between = function (left, right) {
            _q = concat(_q, betwOP, left, andOP, right);
            return me;
        };

        me.inQuery = function (left) {
            var concatList = tableName ? [_q, tableName, '.', left, inOP] : [_q, left, inOP];
            concatList.push('(');
            concatList = concatArray(concatList, arguments, ',', 1);
            concatList.push(')');
            _q = concat.apply(me, concatList);
        };

    };
    return queryBuilder;
});