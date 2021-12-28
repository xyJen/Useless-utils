const dataSource = require('./configs/data-source.json');
const { sortBy } = require('lodash');
const fs = require('fs');
const pinyin = require('pinyin');

console.time('nameTrans');

const originMap = new Map();
dataSource.forEach(item => {
  originMap.set(item.id, item.name);
});

// classify unicode
const unicodeName = [];
const asciiName = [];
dataSource.forEach(item => {
  let name = item.name;
  if (/^[\u4e00-\u9fa5]/.test(item.name)) {
    const hansYin = pinyin(name, {
      style: pinyin.STYLE_NORMAL
    });
    name = hansYin[0].join('');
    
    unicodeName.push({
      id: item.id,
      name
    });
  } else {
    asciiName.push({
      id: item.id,
      name
    });
  }
});

function getSortedList(sortList) {
  const obj = sortList.map(item => {
    return {
      id: item.id,
      name: item.name.toLocaleLowerCase()
    };
  });

  const sortedList = sortBy(obj, [function (item) {
    return item.name;
  }]);
  // console.log('sortedList: ', sortedList);
  const sortedMap = new Map();
  sortedList.forEach(item => {
    sortedMap.set(item.id, item.name);
  });
  
  const resMap = new Map();
  const res = [];
  for (let [key, value] of sortedMap) {
    const originValue = originMap.get(key);
    res.push({ name: originValue });
  }

  return res;
}

const asciiSortedList = getSortedList(asciiName);
const unicodeSortedList = getSortedList(unicodeName);
const sortedResult = [].concat(asciiSortedList, unicodeSortedList);

console.timeEnd('nameTrans');

const str = JSON.stringify(sortedResult, null, 2);
fs.writeFileSync('sort-res.json', str, { encoding: 'utf8' });
