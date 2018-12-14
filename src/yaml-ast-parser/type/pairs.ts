import { Type } from '../type';
import * as ast from '../yamlAST';

const _toString = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (null === data) {
    return true;
  }
  if (data.kind != ast.Kind.SEQ) {
    return false;
  }

  let index,
    length,
    pair,
    keys,
    result,
    object = data.items;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if ('[object Object]' !== _toString.call(pair)) {
      return false;
    }

    if (!Array.isArray(pair.mappings)) {
      return false;
    }

    if (1 !== pair.mappings.length) {
      return false;
    }
  }

  return true;
}

function constructYamlPairs(data) {
  if (null === data || !Array.isArray(data.items)) {
    return [];
  }

  let index,
    length,
    keys,
    result,
    object = data.items;

  result = ast.newItems();
  result.parent = data.parent;
  result.startPosition = data.startPosition;
  result.endPosition = data.endPosition;

  for (index = 0, length = object.length; index < length; index += 1) {
    const pair = object[index];

    const mapping = pair.mappings[0];

    const pairSeq = ast.newItems();
    pairSeq.parent = result;
    pairSeq.startPosition = mapping.key.startPosition;
    pairSeq.endPosition = mapping.value.startPosition;
    mapping.key.parent = pairSeq;
    mapping.value.parent = pairSeq;
    pairSeq.items = [mapping.key, mapping.value];

    result.items.push(pairSeq);
  }

  return result;
}

export default new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs,
});
