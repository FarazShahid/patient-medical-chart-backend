function extractFields(text) {
  const nameMatch =
    text.match(/Patient Name\s*\s*(.+)/i) || text.match(/Patient Name\s+(.+)/i);
  const sexMatch =
    text.match(/Sex\s*\s*([MF])/i) || text.match(/Sex\s+([MF])/i);
  const dobMatch =
    text.match(/DOB\s*\s*([\d\/\-]+)/i) ||
    text.match(/Dob\s*\s*([\d\/\-]+)/i) ||
    text.match(/dob\s*\s*([\d\/\-]+)/i);
  const addressMatch =
    text.match(/Address\s*\s*(.+)/i) || text.match(/Address\s+(.+)/i);
  const cityStateZipMatch =
    text.match(/City\/State\/Zip\s*\s*(.+)/i) ||
    text.match(/City\/State\/Zip\s+(.+)/i);

  return {
    name: nameMatch ? nameMatch[1].trim() : "",
    sex: sexMatch ? sexMatch[1].trim() : "",
    dob: dobMatch ? dobMatch[1].trim() : "",
    address: addressMatch ? addressMatch[1].trim() : "",
    cityStateZip: cityStateZipMatch ? cityStateZipMatch[1].trim() : "",
  };
}

module.exports = extractFields;
