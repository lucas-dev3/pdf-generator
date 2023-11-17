'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var luxon = require('luxon');
var path = _interopDefault(require('path'));
var PDFDocument = _interopDefault(require('pdfkit'));

var WEIGHTS = ['11221', // 0
'21112', // 1
'12112', // 2
'22111', // 3
'11212', // 4
'21211', // 5
'12211', // 6
'11122', // 7
'21121', // 8
'12121' // 9
];

var START = '1111';

/**
 * Representation of Stop portion of the barcode
 *
 * @default
 * @constant
 */
var STOP = '211';

function encode(number) {
  return START + number.match(/(..?)/g).map(interleavePair).join('') + STOP;
}

function interleavePair(pair) {
  var black = WEIGHTS[Math.floor(pair / 10)];
  var white = WEIGHTS[pair % 10];

  var p = '';

  for (var i = 0; i < 5; i++) {
    p += black[i];
    p += white[i];
  }

  return p;
}

function generateStandardStripes(code) {
  var coded = encode(code);
  return coded.split('').map(function (a) {
    return parseInt(a, 10);
  });
}

var color = function color(i) {
  return i % 2 ? '#ffffff' : '#000000';
};

function barcode(doc, startX, startY, code) {
  var y = 0;

  var stripes = generateStandardStripes(code);
  for (var i = 0; i < stripes.length; i++) {
    var width = stripes[i];
    doc.rect(startX + y, startY, width, 50).fill(color(i));
    y += width;
  }
}

function cutSeparator (doc, startY) {
  var marginLeft = doc.page.margins.left;
  var pageWidth = doc.page.width;

  doc.moveTo(marginLeft, startY).lineWidth(1).dash(5, { space: 2 }).lineTo(pageWidth - marginLeft, startY).stroke();
}

var DEFAULT_FORMAT = 'dd/LL/yyyy';

function formatDate (date) {
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_FORMAT;

  return luxon.DateTime.fromJSDate(date).toFormat(format);
}

function header (doc, _ref, _ref2) {
  var digitableLine = _ref.digitableLine,
      paymentPlace = _ref.paymentPlace,
      beneficiary = _ref.beneficiary,
      beneficiaryAddress = _ref.beneficiaryAddress,
      agency = _ref.agency,
      agencyDigit = _ref.agencyDigit,
      account = _ref.account,
      accountDigit = _ref.accountDigit,
      expirationDay = _ref.expirationDay,
      documentDate = _ref.documentDate,
      processingDate = _ref.processingDate,
      card = _ref.card,
      documentNumber = _ref.documentNumber,
      formatedOurNumber = _ref.formatedOurNumber,
      formatedValue = _ref.formatedValue,
      descountValue = _ref.descountValue,
      otherDiscounts = _ref.otherDiscounts,
      feeValue = _ref.feeValue,
      outherFees = _ref.outherFees,
      chargeValue = _ref.chargeValue,
      payer = _ref.payer,
      guarantor = _ref.guarantor;
  var startY = _ref2.startY,
      startX = _ref2.startX,
      smallGutterY = _ref2.smallGutterY,
      smallGutterX = _ref2.smallGutterX,
      line = _ref2.line,
      tableLimit = _ref2.tableLimit,
      lineColor = _ref2.lineColor,
      boxHeight = _ref2.boxHeight,
      gutterX = _ref2.gutterX,
      gutterY = _ref2.gutterY,
      smallFontSize = _ref2.smallFontSize,
      fontSize = _ref2.fontSize,
      largefontSize = _ref2.largefontSize,
      mediumFontSize = _ref2.mediumFontSize,
      fontBold = _ref2.fontBold,
      fontRegular = _ref2.fontRegular,
      logo = _ref2.logo;

  doc.image(logo, startX + smallGutterX, startY, {
    height: 23
  });

  doc.rect(startX + 120, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).font(fontBold).text('237-2', startX + 130, startY + 8);

  doc.rect(startX + 170, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).text(digitableLine, startX + 190, startY + 8);

  doc.rect(startX, startY + boxHeight, tableLimit, line).fill(lineColor);

  // Box
  doc.rect(startX, startY + boxHeight, tableLimit, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Local de Pagamento', startX + smallGutterX, startY + boxHeight + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(paymentPlace, startX + gutterX, startY + boxHeight + gutterY);

  doc.rect(startX, startY + boxHeight * 2, tableLimit * (2 / 4), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Beneficiário', startX + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(8).font(fontBold).text(beneficiary, startX + 40, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(smallFontSize).font(fontBold).text(beneficiaryAddress, startX + 20, startY + boxHeight * 2 + 15);

  doc.rect(startX + tableLimit * (2 / 4), startY + boxHeight * 2, tableLimit * (1 / 4), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Agência / Código do Cedente', startX + tableLimit * (2 / 4) + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(`${agency}-${agencyDigit} / ${account}-${accountDigit}`, startX + tableLimit * (2 / 4) + 50, startY + boxHeight * 2 + gutterY);

  doc.rect(startX + tableLimit * (3 / 4), startY + boxHeight * 2, tableLimit * (1 / 4), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data de Vencimento', startX + tableLimit * (3 / 4) + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatDate(expirationDay), startX + tableLimit * (3 / 4) + 65, startY + boxHeight * 2 + 7);

  // Next line table
  doc.rect(startX, startY + boxHeight * 3, tableLimit * (1.5 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data do Documento', startX + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(documentDate), startX + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (1.5 / 10), startY + boxHeight * 3, tableLimit * (1.5 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data do Processamento', startX + tableLimit * (1.5 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(processingDate), startX + tableLimit * (1.5 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (3 / 10), startY + boxHeight * 3, tableLimit * (0.6 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Carteira', startX + tableLimit * (3 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(card, startX + tableLimit * (3 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (3.6 / 10), startY + boxHeight * 3, tableLimit * (2 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('N° documento', startX + tableLimit * (3.6 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(documentNumber, startX + tableLimit * (3.6 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (5.6 / 10), startY + boxHeight * 3, tableLimit * (2.2 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Nosso Número', startX + tableLimit * (5.6 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatedOurNumber, startX + tableLimit * (5.6 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (7.8 / 10), startY + boxHeight * 3, tableLimit * (2.2 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor do documento', startX + tableLimit * (7.8 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold);

  var widthStringValue = doc.widthOfString(formatedValue);

  doc.text(formatedValue, startX + tableLimit - widthStringValue - 10, startY + boxHeight * 3 + 9);

  // New line
  doc.rect(startX, startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Desconto / Abatimento', startX + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(descountValue, startX + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (1 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outras deduções', startX + tableLimit * (1 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(otherDiscounts, startX + tableLimit * (1 / 5) + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (2 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(+) Mora / Multa', startX + tableLimit * (2 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(feeValue, startX + tableLimit * (2 / 5) + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (3 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outros Acrécimos', startX + tableLimit * (3 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(outherFees, startX + tableLimit * (3 / 5) + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (4 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor cobrado', startX + tableLimit * (4 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold);

  var widthOfStringCharge = doc.widthOfString(chargeValue);

  doc.text(chargeValue, tableLimit - widthOfStringCharge + gutterX, startY + boxHeight * 4 + gutterY);

  // Payer info box
  doc.rect(startX, startY + boxHeight * 5, tableLimit, boxHeight * 3).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Pagador', startX + smallGutterX, startY + boxHeight * 5 + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(payer.name + ' - ' + payer.registerNumber, startX + 30, startY + boxHeight * 5 + 3);

  doc.fontSize(fontSize).font(fontRegular).text(payer.street + ', ' + payer.number + ' ' + payer.complement + ' - ' + payer.district, startX + 30, startY + boxHeight * 5 + 13);

  doc.fontSize(fontSize).font(fontRegular).text(payer.city + ' - ' + payer.state + ' - CEP: ' + payer.postalCode, startX + 30, startY + boxHeight * 5 + 23);

  if (guarantor) {
    doc.fontSize(smallFontSize).font(fontRegular).text('Sacador/Avalista', startX + smallGutterX, startY + boxHeight * 5 + 40);

    doc.fontSize(7).font(fontRegular).text(guarantor.name + ' - ' + guarantor.registerNumber, startX + 50, startY + boxHeight * 5 + 43);

    doc.fontSize(7).font(fontRegular).text(guarantor.street + ', ' + guarantor.number + ', ' + guarantor.district, startX + 50, startY + boxHeight * 5 + 53);

    doc.fontSize(7).font(fontRegular).text(guarantor.city + ' - ' + guarantor.state + ' - CEP: ' + guarantor.postalCode, startX + 50, startY + boxHeight * 5 + 63);
  }

  doc.fontSize(smallFontSize).font(fontRegular).text('Auntênticação Mecânica - Recibo', tableLimit - 70, startY + boxHeight * 8 + 5);
}

function body (doc, _ref, _ref2) {
  var digitableLine = _ref.digitableLine,
      paymentPlace = _ref.paymentPlace,
      beneficiary = _ref.beneficiary,
      beneficiaryAddress = _ref.beneficiaryAddress,
      agency = _ref.agency,
      agencyDigit = _ref.agencyDigit,
      account = _ref.account,
      accountDigit = _ref.accountDigit,
      expirationDay = _ref.expirationDay,
      documentDate = _ref.documentDate,
      processingDate = _ref.processingDate,
      card = _ref.card,
      documentNumber = _ref.documentNumber,
      formatedOurNumber = _ref.formatedOurNumber,
      formatedValue = _ref.formatedValue,
      accept = _ref.accept,
      billValue = _ref.billValue,
      amount = _ref.amount,
      currencyType = _ref.currencyType,
      documentType = _ref.documentType,
      descountValue = _ref.descountValue,
      otherDiscounts = _ref.otherDiscounts,
      feeValue = _ref.feeValue,
      outherFees = _ref.outherFees,
      chargeValue = _ref.chargeValue,
      payer = _ref.payer,
      guarantor = _ref.guarantor,
      instructions = _ref.instructions;
  var startX = _ref2.startX,
      smallGutterY = _ref2.smallGutterY,
      smallGutterX = _ref2.smallGutterX,
      line = _ref2.line,
      tableLimit = _ref2.tableLimit,
      lineColor = _ref2.lineColor,
      boxHeight = _ref2.boxHeight,
      gutterX = _ref2.gutterX,
      gutterY = _ref2.gutterY,
      smallFontSize = _ref2.smallFontSize,
      fontSize = _ref2.fontSize,
      largefontSize = _ref2.largefontSize,
      mediumFontSize = _ref2.mediumFontSize,
      fontBold = _ref2.fontBold,
      fontRegular = _ref2.fontRegular,
      logo = _ref2.logo,
      bodyStarY = _ref2.bodyStarY;

  var startY = bodyStarY;
  var rightSize = 160;
  var widthStringValue = doc.widthOfString(formatedValue);
  // Restore line
  doc.lineWidth(line).undash();

  doc.image(logo, startX + smallGutterX, startY, {
    height: 23
  });

  doc.rect(startX + 120, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).font(fontBold).text('237-2', startX + 130, startY + 8);

  doc.rect(startX + 170, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).text(digitableLine, startX + 190, startY + 8);

  doc.rect(startX, startY + boxHeight, tableLimit, line).fill(lineColor);

  // Local de pagamentp
  doc.rect(startX, startY + boxHeight, tableLimit - rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Local de Pagamento', startX + smallGutterX, startY + boxHeight + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(paymentPlace, startX + gutterX, startY + boxHeight + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data de Vencimento', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatDate(expirationDay), startX + tableLimit - rightSize + 90, startY + boxHeight + gutterX);

  doc.rect(startX, startY + boxHeight * 2, tableLimit, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Beneficiário', startX + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(8).font(fontBold).text(beneficiary, startX + 40, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(smallFontSize).font(fontBold).text(beneficiaryAddress, startX + 40, startY + boxHeight * 2 + 15);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 2, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Agencia/Código do Cedente', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(`${agency}-${agencyDigit} / ${account}-${accountDigit}`, startX + tableLimit - rightSize + 80, startY + boxHeight * 2 + gutterX);

  doc.rect(startX, startY + boxHeight * 3, 100, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data do documento', startX + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(documentDate), startX + gutterX, startY + boxHeight * 3 + gutterX);

  doc.rect(startX + 100, startY + boxHeight * 3, 140, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('N° documento', startX + 100 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(documentNumber, startX + 100 + gutterX, startY + boxHeight * 3 + gutterX);

  doc.rect(startX + 240, startY + boxHeight * 3, 55, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(6).font(fontRegular).text('Espécie do doc.', startX + 240 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(documentType, startX + 240 + gutterX, startY + boxHeight * 3 + gutterX);
  doc.rect(startX + 295, startY + boxHeight * 3, 30, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Aceite', startX + 295 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(accept, startX + 295 + gutterX, startY + boxHeight * 3 + gutterX);

  doc.rect(startX + 325, startY + boxHeight * 3, tableLimit - 325 - rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data processamento', startX + 325 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(processingDate), startX + 325 + smallGutterX, startY + boxHeight * 3 + gutterX);
  // Right side

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 3, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Nosso Número', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatedOurNumber, startX + tableLimit - rightSize + 52, startY + boxHeight * 3 + gutterX);

  doc.rect(startX, startY + boxHeight * 4, 100, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Uso do Banco / CIP', startX + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.rect(startX + 100, startY + boxHeight * 4, 30, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Carteira', startX + 100 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(card, startX + 100 + gutterX, startY + boxHeight * 4 + gutterX);

  doc.rect(startX + 130, startY + boxHeight * 4, 55, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Espécie', startX + 130 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(currencyType, startX + 130 + gutterX, startY + boxHeight * 4 + gutterX);

  doc.rect(startX + 185, startY + boxHeight * 4, 55, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Quantidade', startX + 185 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(amount, startX + 185 + gutterX, startY + boxHeight * 4 + gutterX);

  doc.rect(startX + 240, startY + boxHeight * 4, tableLimit - 240 - rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Valor', startX + 240 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(billValue, startX + 240 + gutterX, startY + boxHeight * 4 + gutterX);
  // Right side
  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 4, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor do documento', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatedValue, tableLimit - widthStringValue - 5, startY + boxHeight * 4 + gutterX);

  doc.rect(startX, startY + boxHeight * 5, tableLimit - rightSize, boxHeight * 5).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Instruções (Texto de responsabilidade do sacador)', startX + smallGutterX, startY + boxHeight * 5 + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(instructions, startX + smallGutterX, startY + boxHeight * 5 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 5, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 5, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Desconto / Abatimento', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 5 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(descountValue, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 5 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 6, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outras deduções', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 6 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(otherDiscounts, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 6 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 7, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(+) Mora / Multa', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 7 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(feeValue, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 7 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 8, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outros Acrécimos', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 8 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(outherFees, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 8 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 9, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor cobrado', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 9 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(chargeValue, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 9 + gutterY);

  doc.rect(startX, startY + boxHeight * 10, tableLimit, boxHeight * 3).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Pagador', startX + smallGutterX, startY + boxHeight * 10 + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(payer.name + ' - ' + payer.registerNumber, startX + 30, startY + boxHeight * 10 + 3);

  doc.fontSize(fontSize).font(fontRegular).text(payer.street + ', ' + payer.number + ' ' + payer.complement + ' - ' + payer.district, startX + 30, startY + boxHeight * 10 + 13);

  doc.fontSize(fontSize).font(fontRegular).text(payer.city + ' - ' + payer.state + ' - CEP: ' + payer.postalCode, startX + 30, startY + boxHeight * 10 + 23);

  if (guarantor) {
    doc.fontSize(smallFontSize).font(fontRegular).text('Sacador/Avalista', startX + smallGutterX, startY + boxHeight * 10 + 40);

    doc.fontSize(7).font(fontRegular).text(guarantor.name + ' - ' + guarantor.registerNumber, startX + 50, startY + boxHeight * 10 + 43);

    doc.fontSize(7).font(fontRegular).text(guarantor.street + ', ' + guarantor.number + ', ' + guarantor.district, startX + 50, startY + boxHeight * 10 + 53);

    doc.fontSize(7).font(fontRegular).text(guarantor.city + ' - ' + guarantor.state + ' - CEP: ' + guarantor.postalCode, startX + 50, startY + boxHeight * 10 + 63);
  }

  doc.fontSize(smallFontSize).font(fontRegular).text('Auntênticação Mecânica - Ficha de Compensação', tableLimit - 115, startY + boxHeight * 13 + 5);
}

function generateBradescoPdf (bill) {
  return new Promise(function (resolve, reject) {
    var buffers = [];
    var MARGIN = 25;
    var realStartY = 170;
    var doc = new PDFDocument({
      autoFirstPage: false
    });
    doc.addPage({
      size: 'A4',
      margin: MARGIN
    });

    var config = {
      startY: realStartY,
      startX: MARGIN,
      smallGutterY: 3,
      smallGutterX: 3,
      line: 0.3,
      tableLimit: doc.page.width - MARGIN - MARGIN,
      lineColor: '#000',
      boxHeight: 25,
      gutterX: 10,
      gutterY: 12,
      smallFontSize: 5.8,
      fontSize: 9,
      largefontSize: 12,
      mediumFontSize: 11,
      fontBold: path.join(__dirname, 'fonts/roboto-regular.ttf'),
      fontRegular: path.join(__dirname, 'fonts/roboto-regular.ttf'),
      logo: path.join(__dirname, 'logos/logo-bradesco.jpg'),
      bodyStarY: realStartY + 25 * 10
    };

    try {
      header(doc, bill, config);
      cutSeparator(doc, realStartY + 25 * 9 + 10);
      body(doc, bill, config);
      barcode(doc, MARGIN, realStartY + 25 * 24, bill.barcodeData);
    } catch (err) {
      reject(err);
    }

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', function () {
      var pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.end();
  });
}

function header$1 (doc, _ref, _ref2) {
  var digitableLine = _ref.digitableLine,
      paymentPlace = _ref.paymentPlace,
      beneficiary = _ref.beneficiary,
      beneficiaryAddress = _ref.beneficiaryAddress,
      agency = _ref.agency,
      agencyDigit = _ref.agencyDigit,
      account = _ref.account,
      accountDigit = _ref.accountDigit,
      expirationDay = _ref.expirationDay,
      documentDate = _ref.documentDate,
      processingDate = _ref.processingDate,
      card = _ref.card,
      documentNumber = _ref.documentNumber,
      formatedOurNumber = _ref.formatedOurNumber,
      formatedValue = _ref.formatedValue,
      descountValue = _ref.descountValue,
      otherDiscounts = _ref.otherDiscounts,
      feeValue = _ref.feeValue,
      outherFees = _ref.outherFees,
      chargeValue = _ref.chargeValue,
      payer = _ref.payer,
      guarantor = _ref.guarantor;
  var startY = _ref2.startY,
      startX = _ref2.startX,
      smallGutterY = _ref2.smallGutterY,
      smallGutterX = _ref2.smallGutterX,
      line = _ref2.line,
      tableLimit = _ref2.tableLimit,
      lineColor = _ref2.lineColor,
      boxHeight = _ref2.boxHeight,
      gutterX = _ref2.gutterX,
      gutterY = _ref2.gutterY,
      smallFontSize = _ref2.smallFontSize,
      fontSize = _ref2.fontSize,
      largefontSize = _ref2.largefontSize,
      mediumFontSize = _ref2.mediumFontSize,
      fontBold = _ref2.fontBold,
      fontRegular = _ref2.fontRegular,
      logo = _ref2.logo;

  doc.image(logo, startX + smallGutterX, startY, {
    height: 23
  });

  doc.rect(startX + 120, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).font(fontBold).text('613', startX + 130, startY + 8);

  doc.rect(startX + 170, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).text(digitableLine, startX + 190, startY + 8);

  doc.rect(startX, startY + boxHeight, tableLimit, line).fill(lineColor);

  // Box
  doc.rect(startX, startY + boxHeight, tableLimit, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Local de Pagamento', startX + smallGutterX, startY + boxHeight + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(paymentPlace, startX + gutterX, startY + boxHeight + gutterY);

  doc.rect(startX, startY + boxHeight * 2, tableLimit * (2 / 4), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Beneficiário', startX + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(8).font(fontBold).text(beneficiary, startX + 40, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(smallFontSize).font(fontBold).text(beneficiaryAddress, startX + 40, startY + boxHeight * 2 + 15);

  doc.rect(startX + tableLimit * (2 / 4), startY + boxHeight * 2, tableLimit * (1 / 4), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Agência / Código do Cedente', startX + tableLimit * (2 / 4) + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(`${agency}-${agencyDigit} / ${account}-${accountDigit}`, startX + tableLimit * (2 / 4) + 65, startY + boxHeight * 2 + gutterY);

  doc.rect(startX + tableLimit * (3 / 4), startY + boxHeight * 2, tableLimit * (1 / 4), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data de Vencimento', startX + tableLimit * (3 / 4) + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatDate(expirationDay), startX + tableLimit * (3 / 4) + 65, startY + boxHeight * 2 + 7);

  // Next line table
  doc.rect(startX, startY + boxHeight * 3, tableLimit * (1.5 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data do Documento', startX + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(documentDate), startX + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (1.5 / 10), startY + boxHeight * 3, tableLimit * (1.5 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data do Processamento', startX + tableLimit * (1.5 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(processingDate), startX + tableLimit * (1.5 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (3 / 10), startY + boxHeight * 3, tableLimit * (0.6 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Carteira', startX + tableLimit * (3 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(card, startX + tableLimit * (3 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (3.6 / 10), startY + boxHeight * 3, tableLimit * (2 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('N° documento', startX + tableLimit * (3.6 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(documentNumber, startX + tableLimit * (3.6 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (5.6 / 10), startY + boxHeight * 3, tableLimit * (2.2 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Nosso Número', startX + tableLimit * (5.6 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatedOurNumber, startX + tableLimit * (5.6 / 10) + gutterX, startY + boxHeight * 3 + gutterY);

  doc.rect(startX + tableLimit * (7.8 / 10), startY + boxHeight * 3, tableLimit * (2.2 / 10), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor do documento', startX + tableLimit * (7.8 / 10) + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold);

  var widthStringValue = doc.widthOfString(formatedValue);

  doc.text(formatedValue, startX + tableLimit - widthStringValue - 10, startY + boxHeight * 3 + 9);

  // New line
  doc.rect(startX, startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Desconto / Abatimento', startX + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(descountValue, startX + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (1 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outras deduções', startX + tableLimit * (1 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(otherDiscounts, startX + tableLimit * (1 / 5) + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (2 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(+) Mora / Multa', startX + tableLimit * (2 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(feeValue, startX + tableLimit * (2 / 5) + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (3 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outros Acrécimos', startX + tableLimit * (3 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(outherFees, startX + tableLimit * (3 / 5) + gutterX, startY + boxHeight * 4 + gutterY);

  doc.rect(startX + tableLimit * (4 / 5), startY + boxHeight * 4, tableLimit * (1 / 5), boxHeight).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor cobrado', startX + tableLimit * (4 / 5) + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold);

  var widthOfStringCharge = doc.widthOfString(chargeValue);

  doc.text(chargeValue, tableLimit - widthOfStringCharge + gutterX, startY + boxHeight * 4 + gutterY);

  // Payer info box
  doc.rect(startX, startY + boxHeight * 5, tableLimit, boxHeight * 3).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Pagador', startX + smallGutterX, startY + boxHeight * 5 + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(payer.name + ' - ' + payer.registerNumber, startX + 30, startY + boxHeight * 5 + 3);

  doc.fontSize(fontSize).font(fontRegular).text(payer.street + ', ' + payer.number + ' ' + payer.complement + ' - ' + payer.district, startX + 30, startY + boxHeight * 5 + 13);

  doc.fontSize(fontSize).font(fontRegular).text(payer.city + ' - ' + payer.state + ' - CEP: ' + payer.postalCode, startX + 30, startY + boxHeight * 5 + 23);

  if (guarantor) {
    doc.fontSize(smallFontSize).font(fontRegular).text('Sacador/Avalista', startX + smallGutterX, startY + boxHeight * 5 + 40);

    doc.fontSize(7).font(fontRegular).text(guarantor.name + ' - ' + guarantor.registerNumber, startX + 50, startY + boxHeight * 5 + 43);

    doc.fontSize(7).font(fontRegular).text(guarantor.street + ', ' + guarantor.number + ', ' + guarantor.district, startX + 50, startY + boxHeight * 5 + 53);

    doc.fontSize(7).font(fontRegular).text(guarantor.city + ' - ' + guarantor.state + ' - CEP: ' + guarantor.postalCode, startX + 50, startY + boxHeight * 5 + 63);
  }

  doc.fontSize(smallFontSize).font(fontRegular).text('Auntênticação Mecânica - Recibo', tableLimit - 70, startY + boxHeight * 8 + 5);
}

function body$1 (doc, _ref, _ref2) {
  var digitableLine = _ref.digitableLine,
      paymentPlace = _ref.paymentPlace,
      beneficiary = _ref.beneficiary,
      beneficiaryAddress = _ref.beneficiaryAddress,
      agency = _ref.agency,
      agencyDigit = _ref.agencyDigit,
      account = _ref.account,
      accountDigit = _ref.accountDigit,
      expirationDay = _ref.expirationDay,
      documentDate = _ref.documentDate,
      processingDate = _ref.processingDate,
      card = _ref.card,
      documentNumber = _ref.documentNumber,
      formatedOurNumber = _ref.formatedOurNumber,
      formatedValue = _ref.formatedValue,
      accept = _ref.accept,
      billValue = _ref.billValue,
      amount = _ref.amount,
      currencyType = _ref.currencyType,
      documentType = _ref.documentType,
      descountValue = _ref.descountValue,
      otherDiscounts = _ref.otherDiscounts,
      feeValue = _ref.feeValue,
      outherFees = _ref.outherFees,
      chargeValue = _ref.chargeValue,
      payer = _ref.payer,
      guarantor = _ref.guarantor,
      instructions = _ref.instructions;
  var startX = _ref2.startX,
      smallGutterY = _ref2.smallGutterY,
      smallGutterX = _ref2.smallGutterX,
      line = _ref2.line,
      tableLimit = _ref2.tableLimit,
      lineColor = _ref2.lineColor,
      boxHeight = _ref2.boxHeight,
      gutterX = _ref2.gutterX,
      gutterY = _ref2.gutterY,
      smallFontSize = _ref2.smallFontSize,
      fontSize = _ref2.fontSize,
      largefontSize = _ref2.largefontSize,
      mediumFontSize = _ref2.mediumFontSize,
      fontBold = _ref2.fontBold,
      fontRegular = _ref2.fontRegular,
      logo = _ref2.logo,
      bodyStarY = _ref2.bodyStarY;

  var startY = bodyStarY;
  var rightSize = 160;
  var widthStringValue = doc.widthOfString(formatedValue);
  // Restore line
  doc.lineWidth(line).undash();

  doc.image(logo, startX + smallGutterX, startY, {
    height: 23
  });

  doc.rect(startX + 120, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).font(fontBold).text('613', startX + 130, startY + 8);

  doc.rect(startX + 170, startY, line, boxHeight).fill(lineColor);

  doc.fontSize(largefontSize).text(digitableLine, startX + 190, startY + 8);

  doc.rect(startX, startY + boxHeight, tableLimit, line).fill(lineColor);

  // Local de pagamentp
  doc.rect(startX, startY + boxHeight, tableLimit - rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Local de Pagamento', startX + smallGutterX, startY + boxHeight + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(paymentPlace, startX + gutterX, startY + boxHeight + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data de Vencimento', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatDate(expirationDay), startX + tableLimit - rightSize + 90, startY + boxHeight + gutterX);

  doc.rect(startX, startY + boxHeight * 2, tableLimit, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Beneficiário', startX + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(8).font(fontBold).text(beneficiary, startX + 40, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(smallFontSize).font(fontBold).text(beneficiaryAddress, startX + 40, startY + boxHeight * 2 + 15);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 2, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Agencia/Código do Cedente', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 2 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(`${agency}-${agencyDigit} / ${account}-${accountDigit}`, startX + tableLimit - rightSize + 80, startY + boxHeight * 2 + gutterX);

  doc.rect(startX, startY + boxHeight * 3, 100, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data do documento', startX + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(documentDate), startX + gutterX, startY + boxHeight * 3 + gutterX);

  doc.rect(startX + 100, startY + boxHeight * 3, 140, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('N° documento', startX + 100 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(documentNumber, startX + 100 + gutterX, startY + boxHeight * 3 + gutterX);

  doc.rect(startX + 240, startY + boxHeight * 3, 55, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(6).font(fontRegular).text('Espécie do doc.', startX + 240 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(documentType, startX + 240 + gutterX, startY + boxHeight * 3 + gutterX);
  doc.rect(startX + 295, startY + boxHeight * 3, 30, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Aceite', startX + 295 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(accept, startX + 295 + gutterX, startY + boxHeight * 3 + gutterX);

  doc.rect(startX + 325, startY + boxHeight * 3, tableLimit - 325 - rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Data processamento', startX + 325 + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(formatDate(processingDate), startX + 325 + smallGutterX, startY + boxHeight * 3 + gutterX);
  // Right side

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 3, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Nosso Número', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 3 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatedOurNumber, startX + tableLimit - rightSize + 52, startY + boxHeight * 3 + gutterX);

  doc.rect(startX, startY + boxHeight * 4, 100, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Uso do Banco / CIP', startX + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.rect(startX + 100, startY + boxHeight * 4, 30, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Carteira', startX + 100 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(card, startX + 100 + gutterX, startY + boxHeight * 4 + gutterX);

  doc.rect(startX + 130, startY + boxHeight * 4, 55, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Espécie', startX + 130 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(currencyType, startX + 130 + gutterX, startY + boxHeight * 4 + gutterX);

  doc.rect(startX + 185, startY + boxHeight * 4, 55, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Quantidade', startX + 185 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(amount, startX + 185 + gutterX, startY + boxHeight * 4 + gutterX);

  doc.rect(startX + 240, startY + boxHeight * 4, tableLimit - 240 - rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Valor', startX + 240 + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(billValue, startX + 240 + gutterX, startY + boxHeight * 4 + gutterX);
  // Right side
  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 4, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor do documento', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 4 + smallGutterY);

  doc.fontSize(mediumFontSize).font(fontBold).text(formatedValue, tableLimit - widthStringValue - 5, startY + boxHeight * 4 + gutterX);

  doc.rect(startX, startY + boxHeight * 5, tableLimit - rightSize, boxHeight * 5).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Instruções (Texto de responsabilidade do sacador)', startX + smallGutterX, startY + boxHeight * 5 + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(instructions, startX + smallGutterX, startY + boxHeight * 5 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 5, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 5, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Desconto / Abatimento', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 5 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(descountValue, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 5 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 6, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outras deduções', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 6 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(otherDiscounts, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 6 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 7, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(+) Mora / Multa', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 7 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(feeValue, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 7 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 8, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(-) Outros Acrécimos', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 8 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(outherFees, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 8 + gutterY);

  doc.rect(startX + tableLimit - rightSize, startY + boxHeight * 9, rightSize, boxHeight).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('(=) Valor cobrado', startX + tableLimit - rightSize + smallGutterX, startY + boxHeight * 9 + smallGutterY);

  doc.fontSize(fontSize).font(fontRegular).text(chargeValue, startX + tableLimit - rightSize + gutterX, startY + boxHeight * 9 + gutterY);

  doc.rect(startX, startY + boxHeight * 10, tableLimit, boxHeight * 3).lineWidth(line).stroke(lineColor);

  doc.fontSize(smallFontSize).font(fontRegular).text('Pagador', startX + smallGutterX, startY + boxHeight * 10 + smallGutterY);

  doc.fontSize(fontSize).font(fontBold).text(payer.name + ' - ' + payer.registerNumber, startX + 30, startY + boxHeight * 10 + 3);

  doc.fontSize(fontSize).font(fontRegular).text(payer.street + ', ' + payer.number + ' ' + payer.complement + ' - ' + payer.district, startX + 30, startY + boxHeight * 10 + 13);

  doc.fontSize(fontSize).font(fontRegular).text(payer.city + ' - ' + payer.state + ' - CEP: ' + payer.postalCode, startX + 30, startY + boxHeight * 10 + 23);

  if (guarantor) {
    doc.fontSize(smallFontSize).font(fontRegular).text('Sacador/Avalista', startX + smallGutterX, startY + boxHeight * 10 + 40);

    doc.fontSize(7).font(fontRegular).text(guarantor.name + ' - ' + guarantor.registerNumber, startX + 50, startY + boxHeight * 10 + 43);

    doc.fontSize(7).font(fontRegular).text(guarantor.street + ', ' + guarantor.number + ', ' + guarantor.district, startX + 50, startY + boxHeight * 10 + 53);

    doc.fontSize(7).font(fontRegular).text(guarantor.city + ' - ' + guarantor.state + ' - CEP: ' + guarantor.postalCode, startX + 50, startY + boxHeight * 10 + 63);
  }

  doc.fontSize(smallFontSize).font(fontRegular).text('Auntênticação Mecânica - Ficha de Compensação', tableLimit - 115, startY + boxHeight * 13 + 5);
}

function generateOmniPdf (bill) {
  return new Promise(function (resolve, reject) {
    var buffers = [];
    var MARGIN = 25;
    var realStartY = 170;
    var doc = new PDFDocument({
      autoFirstPage: false
    });
    doc.addPage({
      size: 'A4',
      margin: MARGIN
    });

    var config = {
      startY: realStartY,
      startX: MARGIN,
      smallGutterY: 3,
      smallGutterX: 3,
      line: 0.3,
      tableLimit: doc.page.width - MARGIN - MARGIN,
      lineColor: '#000',
      boxHeight: 25,
      gutterX: 10,
      gutterY: 12,
      smallFontSize: 5.8,
      fontSize: 9,
      largefontSize: 12,
      mediumFontSize: 11,
      fontBold: path.join(__dirname, 'fonts/roboto-regular.ttf'),
      fontRegular: path.join(__dirname, 'fonts/roboto-regular.ttf'),
      logo: path.join(__dirname, 'logos/logo-omni.jpg'),
      bodyStarY: realStartY + 25 * 10
    };

    try {
      header$1(doc, bill, config);
      cutSeparator(doc, realStartY + 25 * 9 + 10);
      body$1(doc, bill, config);
      barcode(doc, MARGIN, realStartY + 25 * 24, bill.barcodeData);
    } catch (err) {
      reject(err);
    }

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', function () {
      var pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.end();
  });
}

var index = {
  bradesco: generateBradescoPdf,
  omni: generateOmniPdf
};

module.exports = index;
