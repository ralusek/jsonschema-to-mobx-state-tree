'use strict';

const walkNodes = require('jsonschema-nodewalker');

/**
 *
 */
module.exports = (types) => {
  const TYPE_MAP = Object.freeze({
    boolean: (node, meta) => types.boolean,
    number: (node, meta) => types.number,
    string: (node, meta) => {
      const format = node.format;
      if (format === 'datetime') return types.Date;
      return types.string;
    },
    object: (node, meta) => {
      return Object.keys(meta.childObjectProperties).length ?
        node.title ?
          types.model(node.title, meta.childObjectProperties) :
        types.model(meta.childObjectProperties) :
      types.frozen;
    },
    array: (node, meta) => types.array(meta.childArrayItem)
  });

  return (schema = {}, onNode) => walkNodes(schema, (node, meta) => {
    const type = TYPE_MAP[node.type](node, meta);
    const hasDefault = node.default !== undefined;
    const isRequired = meta.isRequired || !meta.lineage;
    const result = (!isRequired || hasDefault) ?
      hasDefault ?
        types.optional(type, node.default) :
      types.maybe(type) :
    type;
    return onNode ? onNode(result, {node, meta, typeMap: TYPE_MAP}) : result;
  });
};
