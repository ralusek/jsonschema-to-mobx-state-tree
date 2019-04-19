'use strict';

const walkNodes = require('jsonschema-nodewalker');

/**
 *
 */
module.exports = (types, options = {}) => {
  const {
    titleDelimiter = '-',
    formatTitle = _formatTitle
  } = options;

  const TYPE_MAP = Object.freeze({
    boolean: (node, meta) => types.boolean,
    number: (node, meta) => types.number,
    string: (node, meta) => {
      const format = node.format;
      if (format === 'datetime') return types.Date;
      return types.string;
    },
    object: (node, meta) => {
      const title = node.title && formatTitle(node.title, {titleDelimiter});
      return Object.keys(meta.childObjectProperties).length ?
        title ?
          types.model(title, meta.childObjectProperties) :
        types.model(meta.childObjectProperties) :
      typeof types.frozen === 'function' ? types.frozen() : types.frozen;
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


/**
 *
 */
function _formatTitle(title, {titleDelimiter}) {
  return title.replace ? title.replace(/\s+/g, titleDelimiter) : title;
}
