Utility for converting JSON Schema to MobX State Tree types.

JSON Schema: http://json-schema.org/
MobX State Tree Types: https://github.com/mobxjs/mobx-state-tree#types-overview

Let's say we had an `event` schema that looked like this:

```javascript
{
  type: 'object',
  properties: {
    title: {
      type: 'string'
    },
    public: {
      type: 'boolean',
      default: false
    },
    time: {
      type: 'object',
      properties: {
        start: {
          type: 'string',
          format: 'datetime'
        },
        end: {
          type: 'string',
          format: 'datetime'
        }
      },
      required: ['start']
    }
  },
  required: ['title', 'public']
}
```

Should output:

```javascript
types.model({
  title: types.string,
  public: types.optional(type.boolean, false),
  time: types.maybe({
    start: types.Date,
    end: types.maybe(types.Date)
  })
});
```

### Usage:

`$ npm install --save jsonschema-to-mobx-state-tree`

```javascript
const { types } = require('mobx-state-tree');
const jsonSchemaToTypes = require('jsonschema-to-mobx-state-tree')(types);

jsonSchemaToTypes(myJSONSchema);
```

We can additionally pass on an `onNode` function to be called every node, whose
response will be used in place of the node that would have been returned in
the conversion.

```javascript
jsonSchemaToTypes(myJSONSchema, (result, {node, meta, typeMap}) => {
  // Log out result, node, meta, and typeMap to see options.
});
```
