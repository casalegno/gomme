/* 
Utilizzando il modulo dedicato al filtraggio degli articoli, eseguo un check sul valore passato.
Se si tratta di un numero attivo l'opzione per modificare il valore
  - Se il numero esiste lo modifico
  - Se non esiste lo inserisco.
Altrimenti nulla.
*/

//recuper il form dedicato agli articolo e mi metto in ascolto.
let form = document.querySelector("#filtra");
form.addEventListener("input", valutaValore);
let active = false;
let padrelinkicona = document.querySelector("div.container");
let htmlResult=document.getElementById("result"); 
let w3container=document.querySelector('.w3-container');
//attivo il click per l'icona inserita, sia all'interno del form, sia nell'aside
// let padrelinkicona=document.querySelector('#articoli');
padrelinkicona.addEventListener("click", e => {
  if (e.target.matches("i.fa-pencil-square-o")) {
    //chiamo la funzione per estarre i dati dell'articolo
    searchEditArticle(e.target.getAttribute("data-code"));
  }
});

/**
 * Questa funzione valuta il valore recuperato dal campo input della tabs articoli per capire se sto inserendo un articoo o altro.
 *  */ 
function valutaValore(e) {
  let filtra = e.target.value;
  //controllo che sia un numero
  nascondiIcona();
  if (!isNaN(filtra) && filtra != "") {
    mostraIcona(filtra);
  }
}

/** 
 * Questa funzione mostra l'icona accanto al campo di inpunt
*/
function mostraIcona(filtra) {
  let icona = document.createElement("i");
  icona.setAttribute("class", "editicon fa fa-pencil-square-o");
  icona.setAttribute("data-code", filtra);
  form.insertAdjacentElement("afterend", icona);
}

/**
 * Questa funzione cancella l'icona accanto al campo input.
 */
function nascondiIcona() {
  let icona = document.querySelector(".editicon");
  if (icona) {
    icona.parentNode.removeChild(icona);
  }
}

/**
 * 
 * @param {string} filtra Il codice dell'articolo da utilizzare come valore base.
 */
async function searchEditArticle(filtra) {
  document.getElementById('modal-w3').style.display="block";
  //creo l'oggetto articolo vuoto
  let art = new Articolo();
  //creo il modulo da modificare
  let htmlFormForEdit= await art.searchArticolo(filtra);
  let htmlOriginalForm=w3container.querySelector('form');
  //spstituisco all'interno della finestra modale il form presente con quello generato
  w3container.replaceChild(htmlFormForEdit,htmlOriginalForm);
  //metto il form generato in ascolto per il subbit
  htmlFormForEdit.addEventListener('submit',async e=>{
    e.preventDefault();
    let descval=e.target.querySelector('.descrizione').value
    if(descval=="" || descval=="null"){
      return;
    }
    //se ho cliccato submit lo nascondo.
    document.getElementById('modal-w3').style.display="none"; 
    await art.updArticolo(htmlFormForEdit);
    console.log('questo è il mio ID: '+art.id);
    let articoloAggiornato=htmlResult.querySelector('.id_'+art.id);
    articoloAggiornato.querySelector('.desc').innerHTML=art.descrizione;
    articoloAggiornato.querySelector('.peso').innerHTML="Peso: "+art.peso;
    articoloAggiornato.querySelector('.quantita').innerHTML="Quantita: "+art.quantita;
    articoloAggiornato.querySelector('.prezzo').innerHTML="€ "+art.prezzo;
  })
}


/**
 * 
 * @param {JSON} obj Il valore restituito dalla chiamata AJAX in gomme.js
 */
function print_catalogo(obj){ 
  //Object.keys(obj) restituisce un array con le chiavi dell'oggetto passato https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  // console.log(Object.keys(obj.res).length);
  htmlResult.innerHTML = "";
  if(Object.keys(obj.res).length==0){
    htmlResult.innerHTML="<p>Non ci sono risultati</p>";
  }
  
  for (var item of obj.res){
      let data = item.modifica.split("-");
      htmlResult.innerHTML +=`<div class="articolo id_${item.id}" data-id="${item.id}"><p class="immagine"><img alt="${item.articolo}" src="./cropped/${item.articolo}.jpg"></p>
          <p class="ads"><span class="peso">Peso:${item.peso}</span> <span class="quantita">Quantita:${item.quantita}</span></p><p class="desc">${item.descrizione}</p>
          <p class="data">${data[0]}</p><p class="prezzo">€: ${item.prezzo}</p><i data-code="${item.articolo}" class="iconinart fa fa-pencil-square-o"></i></div>`;
    
  }
}






/* La classa articolo deve ogni volta inizializzare un nuovo articolo
    Quindi io passo a questa classe il codice dell'articolo
*/
class Articolo {

  constructor() {
    //creo l'oggetto form per l'invio.
    this.formdata=new FormData();
    this.articolo = null;
    this.descrizione = null; //la descrizione dell'articolo
    this.peso = null; //il peso dell'articolo
    this.prezzo = null;
    this.quantita = null;
    this.chiamata=null;//queta variabili mi serve solo per seguire l'andamento delle chiamate
    this.id=null;//indica l'id dell'articolo nel DB e fa riferiento al div che lo contiene 
    //modifica: la data di modifica dell'articolo nel db
    //id: il codice univoco della tabella
  }
  /**
   * 
   * @param {FormData} data Contiene le informazioni del modulo inviato (o comunque quelle necessarie per interfacciarsi con il backend)
   */
  async searchArticolo(codicefiltrato){
    this.articolo=codicefiltrato;
  //aggiungo gli attributi necessari
  this.formdata.set('action','filtra');
  this.formdata.set('filtra',this.articolo);
  this.chiamata="searchArticolo:";
    await this.askDatabase();
    return this.modificaArticolo();
  }

  /* 
  In questo esempio, il metodo fetch() viene utilizzato per inviare una richiesta HTTP GET all'URL ./gomme.php.
  Il blocco then() successivo viene eseguito solo se la richiesta ha avuto successo e restituisce una risposta HTTP con codice di stato 200 OK.
  In caso contrario, il blocco throw lancia un'eccezione con un messaggio di errore specifico.
  Se la richiesta ha successo, i dati ottenuti vengono convertiti in formato JSON utilizzando il metodo json() e passati al blocco then() successivo per essere utilizzati.
  In caso di errore, viene catturata l'eccezione nel blocco catch() e viene stampato un messaggio di errore sulla console. 
  Poichè impiega del tempo ad estrapolare la risposta, tutta la funzione diventa una Primise cosi posso inserire un await per attendere una risposta.
 */
  askDatabase() {
    return new Promise((resolve, reject) => {
      // definisce una promessa per l'elaborazione dei dati
      fetch("./gomme.php", {
        method: "POST",
        body: this.formdata
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Errore nella risposta della richiesta");
          }
          return response.json();
        })
        .then(data => {
          console.log(this.chiamata);
          console.log(data);
          if (data.res[0] != null) {
            this.articolo = data.res[0].articolo;
            this.descrizione = data.res[0].descrizione.toUpperCase();
            this.peso = data.res[0].peso;
            this.quantita = data.res[0].quantita;
            this.prezzo = data.res[0].prezzo;
            this.id = data.res[0].id;
          }
          resolve(); // risolve la promessa per indicare che i dati sono stati elaborati
        })
        .catch(error => {
          console.error("Si è verificato un errore:", error);
          reject(error); // rigetta la promessa in caso di errore
        });
    });
  }
  /*
  Con questa funzione creo il modulo per inserire/modificare l'articolo 
   */
  modificaArticolo() {
    let htmlForm=document.createElement('form');
    htmlForm.setAttribute('id','editform');
    htmlForm.setAttribute('class','w3-container');
    //se la descrizione non esiste allora è un articolo nuovo.
    if(this.descrizione==null){
      this.formdata.set('row[upd]',0);}
      else{this.formdata.set('row[upd]',1);}
      // this.showformdata("modificaArticolo");
    //inserisco l'articolo
    htmlForm.innerHTML+=`<h4>Codice: ${this.articolo}</h4>`;
    //inserisco i campi input
    htmlForm.innerHTML+=`
    <p><label>* Descrizione:</label><input type="text" name="row[descrizione]" value="${this
      .descrizione}" class="w3-input descrizione"/></p>
    <p<label>Peso:</label> <input type="text" name="row[peso]" value="${this.peso}" class="w3-input"/></p>
    <p><label>Quantita:</label> <input type="text" name="row[quantita]" value="${this
      .quantita}" class="w3-input"/></p>
    <p><label>Prezzo:</label> <input type="text" name="row[prezzo]" value="${this.prezzo}" class="w3-input"/></p>
    <p><input type="submit" value="salva" class="w3-btn w3-green" /></p>
    `;
    return htmlForm;
  }

  /**
   * 
   */
  async updArticolo(htmlForm){
    //aggiorno l'articolo con il form generato
    let myFormData=new FormData(htmlForm);
    //this.formdata=data;
    //aggiungo a formdata i dati del nuovo modulo
    for (const [key, value] of myFormData) {
      this.formdata.append(key,value);
    }
    this.formdata.set('row[id]',this.id);
    this.chiamata="updArticolo:";
    await this.askDatabase();
    this.showitems();
  }

  showitems(call){
    console.log(this.chiamata);
    console.log('this.id:'+this.id);
    console.log('this.articolo:'+this.articolo);
    console.log('this.descrizione:'+this.descrizione);
    console.log('this.peso:'+this.peso);
    console.log('this.prezzo:'+this.prezzo);
    console.log('this.quantita:'+this.quantita);
  }

  showformdata(call){
    console.log(call);
     // stampo a console il contenuto di this.formdata
     for (const [key, value] of this.formdata) {
      console.log(`${key}: ${value}`);
     }
  }
}
