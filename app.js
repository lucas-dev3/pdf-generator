const express = require("express");
const app = express();
const port = 3333;
const bodyParser = require("body-parser");
var cors = require("cors");
const { engine } = require("express-handlebars");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Erro na conexão ao MongoDB:"));
db.once("open", function () {
  console.log("Conectado ao MongoDB com sucesso");
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const collection = db.collection("transactions");
    const boleto = await collection.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (boleto) {
      const bill = boleto.bill;
      return res.render("boleto", {
        bill,
        store:
          boleto.installments.length > 1 ? "" : boleto.installments[0].store_id,
        parcela:
          boleto.installments.length > 1
            ? boleto.order_id
            : boleto.installments[0].installment_number,
        contrato:
          boleto.installments.length > 1
            ? "Boleto avulso"
            : boleto.installments[0].contract_id,
        oderTitle: boleto.installments.length > 1 ? "Ordem ID" : "Parcela",
      });
    } else {
      return res.status(404).send("Boleto não encontrado.");
    }
  } catch (error) {
    return res.status(500).send("Erro interno do servidor.");
  }
});
app.get("/carne/:store/:contract/:cpf", async (req, res) => {
  const { store, contract, cpf } = req.params;
  const cpfFormated = cpf.replace(/\D/g, "");
  try {
    const api_response = await fetch(`https://carne-feirao.s1solucoes.com.br/v1/booklet/${store}/${contract}/${cpfFormated}`);
    let data = await api_response.json();
    data =  data.details.details;
    console.log("retorno da api de carne----------");
    console.log(data);
    let bils = [];
    let error = "";
    const collection = db.collection("transactions");
    for (let i = 0; i < data.length; i++) {
      if (data[i].bill_number && !data[i].payment_date) {
        const boleto = await collection.findOne({order_id: data[i].bill_number});
        if (boleto) {
          const bill = boleto.bill;
          bils.push({
            bill,
            id: boleto._id,
            store:
              boleto.installments.length > 1
                ? ""
                : boleto.installments[0].store_id,
            parcela:
              boleto.installments.length > 1
                ? boleto.order_id
                : boleto.installments[0].installment_number,
            contrato:
              boleto.installments.length > 1
                ? "Boleto avulso"
                : boleto.installments[0].contract_id,
            oderTitle: boleto.installments.length > 1 ? "Ordem ID" : "Parcela",
          });
        }
      }
    }
    if (bils.length === 0) {
      error = "Boletos não encontrados.";
    }
    return res.render("carne", { bils, error});
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno do servidor.");
  }
});
app.get("/carne/pdf/:store/:contract/:cpf", async (req, res) => {
  const { store, contract, cpf } = req.params;
  try{
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(`http://localhost:3333/carne/${store}/${contract}/${cpf}`, {
      waitUntil: "networkidle2",
    });
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();
    
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=carne-${contract}.pdf`,
      "Content-Length": pdf.length,
    });

    return res.send(pdf);
  }catch(e){
    console.log(e);
    return res.status(500).send("Erro interno do servidor.");
  }

});

app.get("/pdf/:id", async (req, res) => {
  const { id } = req.params;
  const collection = db.collection("transactions");
  const boleto = await collection.findOne({
    _id: new mongoose.Types.ObjectId(id),
  });
  if (!boleto) {
    return res.status(404).send("Boleto não encontrado.");
  }
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:3333/${id}`, {
    waitUntil: "networkidle2",
  });
  const pdf = await page.pdf({ format: "A4" });
  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=boleto-${id}.pdf`,
    "Content-Length": pdf.length,
  });

  return res.send(pdf);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
