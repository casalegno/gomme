let now = new Date();
console.log(`Sono nella pagina articoli.js ${now}`);


class Articolo {
	constructor (codice,descrizione,peso,quantita,prezzo){
		this.codice=codice;
		this.descrizione=descrizione;
		this.peso=peso;
		this.quantita=quantita;
		this.prezzo= prezzo;
		this.form=document.querySelector('#formeditart');
	}

	//creo la funzione che mostra le info dell'articolo
	mostraaschermo(event){
		let div=document.createElement('div');
		div.innerHTML=`<div>
		<p><input type="text" name="editdesc" value="${this.descrizione}" /></p>
		<p><input type="text" name="editpeso" value="${this.peso}" /></p>
		<p><input type="text" name="editquan" value="${this.quantita}" /></p>
		<p><input type="text" name="editprez" value="${this.prezzo}" /></p>
		<p><input type="submit" value="salva" /></p></div>`;
		this.form.append(div);
		// event.target.append(div);

	}

	salvadati(){
		this.form.innerHTML="Documento Salvato";
	}

	//getter e setter, vanno usati in combinazione. possono essere usati per modificare una variabile o per fare delle operazioni senza usare un metodo.
	//La proprietà getter viene eseguita quando obj.propName viene letto, la proprietà setter, invece, quando viene assegnato.
	//https://it.javascript.info/property-accessors
	get codice(){
		return this._codice;
	}

	set codice(nc){
		if(isNaN(nc)){
			console.log(`Attenzione, ${nc} non è un codice valido`);
			this._codice='';
		}else{
			this._codice=nc;
		}
	}

	salva(id=0){
		if(id==0){
			console.log(`Non ho un id per l'aticolo quindi lo inserisco nuovo`);
		}
		else{
			console.log(`Aggiorno l'articolo con i parametri poichè ho l'id ${id}`);
		}
	}

}

let ea=document.querySelector('#formeditart');
ea.addEventListener('submit',search);
let thisart=new Articolo();//(obj.articolo,obj.descrizione,obj.peso,obj.quantita,obj.prezzo);


async function search(e) {
	e.preventDefault();

	//recupero il valore di tutti i campi del form
	let fdata= new FormData(e.target);
	let isart=fdata.get('editart');
	//controllo se ho gia definito l'articolo
	let isdesc=fdata.get('editdesc');
	if(isdesc != null){
		console.log('ho gia un risultato');
		thisart.salvadati();
		return
	}else{
		if(isNaN(isart)){
			console.log('non è un numero');
			return;
		}
		console.log(`Cerco l'articoo ${isart}`);
	}
	
	

	await fetch('gomme.php', {
	  method: 'POST',
	  body: fdata
	})
	.then(response => response.json())
	.then(result=>{
		let obj=result.res[0];
		//creo l'oggetto articolo
		
		//lo mostro in modifica
		thisart.mostraaschermo(e);
	});

	// let response = await fetch('gomme.php', {
	// 	method: 'POST',
	// 	body: fdata
	//   })
	// // the server responds with confirmation and the image size
	// let result = await response.json();
	// let obj=result.res[0];
	// //console.log(obj);
	// let thisart=new Articolo(obj.articolo,obj.descrizione,obj.peso,obj.quantita,obj.prezzo);
	// thisart.mostraaschermo(e);
  }