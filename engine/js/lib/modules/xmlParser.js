define(['jquery'], function () {
    var parsingMethods = {
        derive: function ($e, col, row) {
            return row[col.selector];
        },
        attr: function ($e, col) {
            return $e.attr(col.selector);
        }, text: function ($e, col) {
            return $e.find(col.selector).text();
        }
    }, parseAttrs = function ($e) {
        var obj = {}, keys = _.toArray(arguments);
        _.each(keys.slice(1), function (ke) {
            obj[ke] = $e.attr(ke);
        });
        return obj;
    }, parseNodes = function ($e) {
        var obj = {}, keys = _.toArray(arguments);
        _.each(keys.slice(1), function (ke) {
            obj[ke] = parsingMethods.text($e, { selector: ke });
        });
        return obj;
    }, nsph = '{0}';
    var xmlParser = function (xml, config) {
        var me = this;
        var parse = function () {
            var $xml, $root, data = config.itemSelector ? [] : {};
            if (_.isString(xml)) {
                var xmlDoc = $.parseXML(xml);
                $xml = $(xmlDoc);
            }
            else if (_.isObject(xml) && xml.length) $xml = xml;
            if (!$xml) return data;
            if (config.root instanceof Function)
                $root = config.root($xml);
            else if (config.root)
                $root = $xml.find(config.root);
            $root = $root || $xml;

            var parseFields = function (method, row, $e, fields) {
                if (!fields) return row;
                row = row || {};
                for (var colName in fields) {
                    var col = fields[colName], val = null;
                    if (col.prefilter instanceof Function)
                        if (!col.prefilter($root, $e, row)) continue;
                    if (col.selector instanceof Function)
                        val = col.selector($root, $e, row);
                    else if (col.selector) val = parsingMethods[method || 'text']($e, col, row);
                    val = col.defaultValue ? val || col.defaultValue : val;
                    row[colName] = col.format ? col.format(val) : val;
                }
                return row;
            };
            if (config.itemSelector) {
                $.each($root.find(config.itemSelector), function (idx, elt) {
                    var $elt = $(elt);
                    if (config.prefilter && config.prefilter instanceof Function && !config.prefilter($root, $elt)) return true;
                    var row = parseFields('text', {}, $elt, config.nodes);
                    row = parseFields('attr', row || {}, $elt, config.attributes);
                    row = parseFields('derive', row || {}, $elt, config.derivatives);
                    if (!$.isEmptyObject(row)) {
                        if (config.postfilter && config.postfilter instanceof Function && !config.postfilter(row, $root, $elt)) return true;
                        data.push(row);
                    }
                });
            } else {
                var row = parseFields('text', {}, $root, config.nodes);
                row = parseFields('attr', row || {}, $root, config.attributes);
                data = row;
            }
            return data;
        };
        var validateXML = function () {
            var validate = true, unvalidate = false, status = true, $xml, $root;
            if (_.isString(xml)) {
                var xmlDoc = $.parseXML(xml);
                $xml = $(xmlDoc);
            }
            else if (_.isObject(xml)) $xml = xml;

            if (config.root)
                $root = $xml.find(config.root);
            if (!$root.length) return unvalidate;

            var data = config.itemSelector ? [] : {};

            var parseValidateFields = function (method, row, $e, fields) {
                row = row || {};
                for (var colName in fields) {
                    var col = fields[colName], val = null;
                    if (col.prefilter instanceof Function)
                        if (!col.prefilter($root, $e))
                            return unvalidate;

                }
                return validate;
            };

            if (config.itemSelector) {
                $.each($root.children(), function (idx, elt) {
                    var $elt = $(elt);
                    var that = this;
                    if (that.nodeName == config.itemSelector) {
                        if (config.prefilter && config.prefilter instanceof Function && !config.prefilter($root, $elt)) {
                            status = unvalidate; return unvalidate
                        };
                        var row = parseValidateFields('text', {}, $elt, config.nodes);

                        if (row == true) {
                            if (config.attributes)
                                row = parseValidateFields('attr', row || {}, $elt, config.attributes);
                            if (row == false) { status = unvalidate; return unvalidate; }
                        }
                        else {
                            status = unvalidate;
                            return unvalidate;
                        }

                    }
                    else {
                        status = unvalidate;
                        return unvalidate;
                    }
                });
            }

            return status;

        };
        me.validateXML = validateXML;
        me.parse = parse;
    };
    xmlParser.parseAttrs = parseAttrs;
    xmlParser.parseNodes = parseNodes;
    xmlParser.getXPath = function ($xml) {
        var path = $xml.parents().andSelf();
        var xpath = '/';
        for (var i = 0; i < path.length; i++) {
            var nd = path[i].nodeName.toLowerCase();
            xpath += '/';
            if (nd != 'html' && nd != 'body')
            { xpath += nd + '[' + ($(path[i - 1]).children().index(path[i]) + 1) + ']'; }
            else
            { xpath += nd; }
        }
        return xpath;
    };
    var parentsUntil = function ($elt, sel, res) {
        res = res || [];
        var $par = $elt.parent(), par = $par[0];
        res.push($par);
        if (par.localName == 'document' || par.localName == 'schema' || par.localName == sel) return res;
        parentsUntil($par, sel, res);
        return res;
    };
    xmlParser.getXPathUsingSchema = function ($root, $xml) {
        var path = $xml.parents().andSelf(), xpath = '', $schema = $root.find('schema,xs\\:schema');
        var uri = $schema.attr('targetNamespace'), namespace = '', attrs = $schema[0].attributes;
        for (var k = 0; k < attrs.length; k++) {
            var an = attrs[k], ln = an.localName;
            if (ln == 'targetNamespace') continue;
            if ($schema.attr(an.name) == uri) { namespace = ln; break; }
        }
        for (var j = 0; j < path.length; j++) {
            var pth = path[j], $pth = $(pth), nd = pth.nodeName.toLowerCase(), nm = $pth.attr('name'), plast = plast;
            switch (nd) {
                case 'xs:element':
                    var parents = parentsUntil($pth, 'element');
                    /*if (parents.length === 3) {
                        if (_.first(parents).parent()[0].localName != 'schema')
                            xpath += '[1]';
                    }*/
                    xpath += (xpath.length ? '/' : '//') + nsph + nm;
                    break;
            }
        }
        return kendo.format(xpath, namespace ? (namespace + ':') : '');
    };
    return xmlParser;
});