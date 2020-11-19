exports.formatTable = (data) => {
  let output = "";

  const header = data[0];
  output += `| ${header.join(" | ")} |\n`;
  output += `| ${header.map(() => "---").join(" | ")} |\n`;
  for (const result of data.slice(1)) {
    output += `| ${result.join(" | ")} |\n`;
  }
  return output;
};

const mergeJsMjs = (items) => {
  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const item = items[i];
    if (
      prev.endsWith(" (mjs)") &&
      item.endsWith(" (js)") &&
      prev.slice(0, -6) === item.slice(0, -5)
    ) {
      items.splice(i - 1, 2, prev.slice(0, -6));
      i--;
    }
  }
};

exports.dedupeLines = (data) => {
  const headers = new Map();
  const lines = new Map();
  for (const line of data.slice(1)) {
    const header = line[0];
    const lineData = line.slice(1);
    const key = lineData.join("|");
    let list = headers.get(key);
    if (list === undefined) {
      list = [];
      headers.set(key, list);
      lines.set(key, lineData);
    }
    list.push(header);
  }
  const results = [data[0]];
  for (const [key, headerItems] of headers) {
    mergeJsMjs(headerItems);
    results.push([headerItems.join("<br><br>"), ...lines.get(key)]);
  }
  return results;
};

exports.transpose = (data) => {
  const length = data[0].length;
  const results = [];
  for (let i = 0; i < length; i++) {
    const resultLine = [];
    for (const line of data) {
      resultLine.push(line[i]);
    }
    results.push(resultLine);
  }
  return results;
};

exports.markOutlinersInLine = (data) => {
  for (const line of data.slice(1)) {
    const map = new Map();
    for (const item of line.slice(1)) {
      map.set(item, (map.get(item) || 0) + 1);
    }
    const max = Math.max(...map.values());
    if (max <= 2) continue;
    for (let i = 1; i < line.length; i++) {
      const count = map.get(line[i]);
      if (count >= line.length / 2) {
        line[i] += " ✅";
      } else if (count < max - 2) {
        line[i] += " 💎";
      } else if (count < max - 1) {
        line[i] += " 🟡";
      }
    }
  }
};

exports.removeIdenticalLines = (data) => {
  const newData = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const line = data[i];
    if (new Set(line.slice(1)).size !== 1) {
      newData.push(line);
    }
  }
  return newData;
};

exports.splitCombinedHeader = (data) => {
  const headerLine = data[0];
  const newData = [[...headerLine[0].split("<br>"), ...headerLine.slice(1)]];
  for (let i = 1; i < data.length; i++) {
    const line = data[i];
    newData.push([...line[0].split("<br>"), ...line.slice(1)]);
  }
  return newData;
};

exports.swapColumns = (data, a, b) => {
  return data.map((line) => {
    const copy = line.slice();
    const temp = copy[a];
    copy[a] = copy[b];
    copy[b] = temp;
    return copy;
  });
};

exports.comparator = (a, b) => {
  a = a.replace(/\.m?jso?n?$/, "");
  b = b.replace(/\.m?jso?n?$/, "");
  if (a.startsWith(b)) return 1;
  if (b.startsWith(a)) return -1;
  return a < b ? -1 : a === b ? 0 : 1;
};
