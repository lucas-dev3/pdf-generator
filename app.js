const express = require("express");
const { bill, bradesco } = require("boleto-br");
const bradescoPDF = require("./dist/index").bradesco;
const app = express();
const port = 3333;
const bodyParser = require('body-parser');
const moment = require('moment');
var cors = require('cors')

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.post("/", (req, res) => {
  const {
    expirationDay,
    processingDate,
    documentDate,
    value,
    documentNumber,
    ourNumber,
    payer
  } = req.body;
  const boletos = [
    {
      paymentPlace:
        "Pagável preferencialmente na rede Bradesco ou Bradesco Expresso.",
      beneficiary: "FEIRAO DOS MOVEIS MAGAZINE LTDA",
      beneficiaryAddress:
        "R CEARA 553, NOVA IMPERATRIZ, IMPERATRIZ - MA Cep 65907-90",
      instructions:
        "Após o vencimento cobrar multa de 2,00%, mais juros ao mês de 1,00%.",
      agency: "2365",
      agencyDigit: "0",
      account: 11552,
      accountDigit: "5",
      // expirationDay: new Date(2023, 10, 14),
      expirationDay: new Date(moment(expirationDay, 'YYYY-MM-DD')),
      documentDate: new Date(moment(documentDate, 'YYYY-MM-DD')),
      processingDate: new Date(moment(processingDate, 'YYYY-MM-DD')),
      card: "9",
      documentNumber: documentNumber,
      ourNumber: ourNumber,
      value: value,
      formatedValue: (value/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      documentType: "DM",
      accept: "N",
      currencyType: "Real (R$)",
      amount: "",
      valueOf: "",
      descountValue: "",
      otherDiscounts: "",
      feeValue: "",
      outherFees: "",
      chargeValue: "",
      payer: payer,
      // payer: {
      //   name: "DHYOGOSANTOSLEAL",
      //   registerNumber: "054.557.173-16",
      //   street: "AV TESTE TESTE",
      //   number: "",
      //   complement: " ",
      //   district: "CENTRO",
      //   city: "IMPERATRIZ",
      //   state: "MA",
      //   postalCode: "65912-080",
      // },
      guarantor: {
        name: "FEIRAO DOS MOVEIS MAGAZINE LTDA",
        registerNumber: "074.064.502/0001-12",
        street: "R CEARA",
        number: "553",
        district: "NOVA IMPERATRIZ",
        complement: " ",
        city: "Imperatriz",
        state: "MA",
        postalCode: "65900-110",
      },
    },
  ];
  const bradescoBill = bill(bradesco);
  const { generateBillData } = bradescoBill;
  generateBillData(boletos)
    .then((data) => {
      return bradescoPDF(data[0]); // Supondo que você só quer gerar um boleto
    })
    .then((pdf) => {
      res.contentType("application/pdf");
      res.send(pdf);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Erro ao gerar boleto");
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
