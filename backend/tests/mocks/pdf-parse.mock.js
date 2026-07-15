const pdfParse = jest.fn().mockResolvedValue({
  numpages: 1,
  numrender: 1,
  info: { title: "Test Document" },
  metadata: null,
  version: "1.10.100",
  text: "Hello Test Document\n",
});

module.exports = pdfParse;
module.exports.default = pdfParse;
