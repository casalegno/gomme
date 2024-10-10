// A $( document ).ready() block.
$(document).ready(function() {
    console.log("ready!");
    //gestisco le tab
    //controllo se esiste una tab gia attiva.
    cookietab = getCookie("tabs");
    (cookietab != "") ? cookietabs(): '';

    /**
     * Variabili da utilizzare durante il preventivo
     * */
    zama = 5.05, //11-2022
        stampo = 38.25,
        ricarico = 3.05,
        dilazione = (0.12 * 75) / 365;

    //blocco i form
    $('form').on('submit', function(e) {
        e.preventDefault();
        console.log('Prima dell\'invio: ' + $(this).serialize());
        //controllo se invio dei valori ad AJAX oppure no.
        var input = $(this).find(".campo").val();
        if (input != '') {
            //svuoto la sezione dei risultati
            $('#result').empty();
            //eseguo la chiamata ajax
            $.ajax({
                type: "POST",
                url: 'gomme.php',
                data: $(this).serialize(), // serializes the form's elements.
                success: function(result) {
                    //visualizzo il risultato in console
                    obj = JSON.parse(result);
                    console.log('Il risultato dell\'oggetto: ');
                    console.log(obj); //tutto l'oggetto
                    if (obj.act == "cerca") {
                        risultatiricerca(obj);
                    }
                    if (obj.act == "modifica") {
                        editgomma(obj);
                    }
                    if (obj.act == "inserisci") {
                        obj = JSON.parse(result);
                        console.log("Il risultato della richiesta è:", obj.res.gomma);
                        obj.input = obj.res.gomma + 1;
                        $('#next_id').html(obj.input);
                        contenutogomma(obj);
                    }
                    if (obj.act == "aggiorna") {
                        //console.log('Il risultato dell\'oggetto.rows aggiornato: ');
                        //console.log(obj.rows);
                        console.log(obj.res);
                        //$('#aggiorna .modifica').addClass('upd').val('Aggiornata');
                        updatebtn(1);
                    }
                    if (obj.act == "filtra") {
                        print_catalogo(obj);
                    }
                } //success
            });
        } else {
            console.log('Campo vuoto');
        }
    }); //form

    /**
     * Azioni da intraprendere quando succede qualcosa nel documento
     * */
    var timeout = null;
    $(document)
        //GENERALE - gestisco la visualizzazione delle tabs e l'icona mobile
        .on('click', 'nav li>a', attivotab)
        .on('click', '.humburger', function(e) { $('nav ul').toggle(); })
        //MODIFICA - clicco sul pulsante registra
        .on('input', '#aggiorna input[type=text]', updatebtn)
        //CERCA - clicco sulla gomma
        .on('click', '.gomma', modificagomma)
        //PREVENTIVO - modifico i valori del preventivo (agisce solo quando clicco sugl input)
        .on('input ', '#prezzo', prezzo)
        .on('dblclick','.in_art', function(){
            document.getElementById("filtra").value=$(this).val();
            $("nav.main a:contains('Catalogo'),nav.sub a:contains('Articoli')").click();
            //$("nav.sub a:contains('Articoli')").click();
            $('#articoli').submit();
        })
        .on('dblclick','articolo .desc',edit_catalogo)

}); //jquery


/**
 * ------------------------------------------------------------------
 * QUESTE FUNZIONI SONO FISSE E NON VANNO MODIFICATE ----------------
 * ------------------------------------------------------------------
 * */

/**
 * Funzione che gestisce la selezione tra gli articoli da visualizzare a catalogo
 * viene chiamata da
 * .on('input ', '#articoli', function(){
      //ogni volta che premo una lettera lui mi azzera il timout
      if(timeout !== null){
            clearTimeout(timeout);
      }
      timeout= setTimeout(articoli,300);
  })
 * Al momento non è attiva, sostituita dalla funzione Form.submit()
 * */
function articoli(e) {
    console.log('Preparo la lista degli articoli');
    //preparo i dati da inviare
    var data = new FormData();
    var filtro = document.getElementById("filtra").value;
    data.append('filtra', filtro);
    data.append('action', 'filtra');
    console.log(isNaN(filtro));
    if (filtro != '') {
        //svuoto la sezione dei risultati
        $('#result').empty();
        //eseguo la chiamata ajax
        var xhttp = new XMLHttpRequest();
        //questa è la funzione di risposta
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                //document.getElementById("result").innerHTML = xhttp.responseText;

                //poichè il risultato della pagina gomme.php è in formato Json
                obj = JSON.parse(xhttp.responseText);
                console.log(obj.res);
                print_catalogo(obj);
            }
        }
        xhttp.open("POST", "gomme.php", true);
        xhttp.send(data);
    }
}
function edit_catalogo(e){
    var codice = $(this).text();
    console.log(codice);
}
function print_catalogo(obj){
    var res=document.getElementById("result");
    for (var item of obj.res){
        data = item.modifica.split("-");
            $('#result').append(
            '<div class="articolo">' +
            '<p class="codice"><img alt="' + item.articolo + '" src="./cropped/' + item.articolo + '.jpg"></p>' +
            '<p class="ads">Peso:' + item.peso + '     Quantita:' + item.quantita + '</p>'+
            '<p class="desc">' + item.descrizione + '</p>' +
            '<p class="data">' + data[0] + '<br /> €: ' + item.prezzo +'</p>' +
            '</div>'
        );
    }
}


/**
 * Funzione che gestisce il  calcolo dei prezzi degli articoli basandosi su variabili
 * pre impostate. 
 * .peso: il peso del pezzo
 * .pezzi: quanti pezzi in uno stampo
 * .stampe: stampe totali da realizzare.
 * */
function prezzo(e) {
    console.log('Mi preparo per calcolare il prezzo');
    var peso = $('#prezzo .peso');
    var pezzi = $('#prezzo .pezzi');
    var stampe = $('#prezzo .stampe');
    var totpz = (pezzi.val() * stampe.val());
    var totkg = (totpz * peso.val()) / 1000;
    if (pezzi.val() != '' && stampe.val() != '') {
        console.log('Totale pz: ' + (pezzi.val() * stampe.val()));
        $('.totpz').html(totpz);
    }
    if (totpz != '' && peso.val() != '') {
        console.log('Totale peso: ' + totkg);
        $('.totkg').html(totkg.toFixed(2));
    }
    //se ho tutti i valori completi calcolo il prezzo
    if (totkg != '') {
        costo_zama = (totkg.toFixed(2) * zama);
        costo_materiale = costo_zama + stampo;
        dilazione_pag = (costo_materiale * dilazione);
        utile_commessa = (costo_materiale + dilazione_pag) * ricarico;
        valore_con_utile = utile_commessa + costo_materiale + dilazione_pag; // calcolato sul totale dei pezzi
        costo_pezzo = valore_con_utile / totpz;
        console.log('materiale ' + costo_materiale);
        console.log('Valore con utile ' + valore_con_utile + ' su ' + pezzi.val());
        $('.europz').html(costo_pezzo.toFixed(3));
        $('.eurokg').html(((costo_pezzo / peso.val()) * 1000).toFixed(2));
    }
}

/**
 * Funzione che gestisce il contenuto della gomma, valido per la modifica di una gomma e valido per l'inserimento di una gomma
 * */
function contenutogomma(obj) {
    console.log('Il valore di $i appena accedo a contenutogomma', $i);
    //sviluppo la gestione delle linee.
    var $i = 0
    console.log('Il valore di $i dopo aver dichiarato la variabile $i', $i);
    $('#aggiorna').html('<input type="hidden" name="action" value="aggiorna">' +
        '<input type="hidden" class="aggiorna campo" name="aggiorna" value="' + obj.input + '">');
    $('#aggiorna')
        .prepend('<p><input type="submit" value="Registra" class="' + obj.act + '"></p>')
        .on('click', '.badd', function(e) {
            console.log('Aggiungo una riga');
            console.log('Il valore di $i prima dell\'incrementeo è', $i);
            $i++
            console.log('Il valore di $i subito dopo l\'incrementeo è', $i);
            var rowItem = '<p class="row n' + $i + '"><input type="text" name="row[' + $i + '][articolo]" value="" />' +
                '<input type="text" name="row[' + $i + '][extra]" value="" />' +
                '<input type="hidden" name="row[' + $i + '][id]" value="new" />' +
                '<b name="badd" class="badd">+</b><b name="bdel" class="bdel">-</b></p>';
            $("#aggiorna").append(rowItem);
            console.log('Abbiamo un totale di ' + $(".row").length + ' righe');
        })
        .on('click', '.bdel', function(e) {
            console.log('Cancello una riga');

            if ($(".row").length > 1) {
                //controllo se la riga è nuova o ha un ID
                console.log(' la riga è ' + $(this).siblings("input[name*='id']").val());
                let riga_da_cancellare = $(this).siblings("input[name*='id']").val();

                //se la riga è nuova la cancello
                if (riga_da_cancellare == 'new') {
                    $(this).parents(".row").remove();
                } else {
                    //se la riga ha un id, la elimino dal dB, quindi la cancello.  
                    $.ajax({
                        type: "POST",
                        url: 'gomme.php',
                        data: { action: "delrig", delrig: riga_da_cancellare },
                        success: function(result) {
                            updatebtn(1);
                        }
                    });
                    $(this).parents(".row").remove();
                    console.log('non posso cancellare la riga con id ' + riga_da_cancellare);
                }

            }

            console.log('Abbiamo un totale di ' + $(".row").length + ' righe');
        });
    $.each(obj.res, function(index, item) {
        if (obj.act == "modifica") {
            $('#aggiorna').append(
                '<p class="row"><input type="text" class="in_art" name="row[' + item.id + '][articolo]" value="' + item.articolo + '" />' +
                '<input type="text" class="in_ext" name="row[' + item.id + '][extra]" value="' + item.extra + '" />' +
                '<input type="hidden" name="row[' + item.id + '][id]" value="' + item.id + '" />' +
                '<b name="badd" class="badd">+</b><b name="bdel" class="bdel">-</b></p>'
            );
        } else {
            $('#aggiorna').append(
                '<p class="row"><input type="text" class="in_art" name="row[0][articolo]" value="" />' +
                '<input type="text" name="row[0][extra]" value="" />' +
                '<input type="hidden" class="in_ext" name="row[0][id]" value="new" />' +
                '<b name="badd" class="badd">+</b><b name="bdel" class="bdel">-</b></p>'
            );
        }
    });


}


function updatebtn(d) {
    if (d == "1") {
        $('#aggiorna .modifica').addClass('upd').val('Aggiornata');
    } else {
        $('#aggiorna .modifica').removeClass('upd').val('Registra');
    }

}

/**
 * Funzione di modifica del contenuto della gomma
 * $obj viene restituito dalla chiamata AJAX di JS attraverso gomma.php
 * 
 * */
function editgomma(obj) {
    if (obj.res.length == 0) {
        console.log('Niente gomma');
        $('.message').html('Gomma ' + obj.input + ' non trovata');
        $('aside form').empty();
    } else {
        console.log(obj.res);
        //questo è il messsaggio di modifica.
        $('.message').html(
            '<p>Modifico la gomma ' + obj.input + '</p>');
        contenutogomma(obj);
    }
}


/**
 * Questa funzione viene attivata quando dal campo ricerca clicco sulla gomma
 * si occupa di modificare la tab visualizzando la pagina della gomma da modificare
 * e compila automaticamente il modulo e lo invia
 * */
function modificagomma(e) {
    var ngomma = $(this).children('.numero').text();
    console.log('sono in modifica gomma '.ngomma);
    $("nav a:contains('modifica')").click();
    $("#modifica input[type=text]").val(ngomma);
    $("#modifica input[type=submit]").click();
    //$("#modifica form").submit();
}


/** 
 * Funzione di ricerca
 * Mostra i risultati di ricerca di una gomma
 * */
function risultatiricerca(obj) {
    if (obj.res.length == 0) {
        console.log('Nessun risultato');
        $('#result').append(
            '<p class="center">Nessun Risultato trovato</p>'
        );
    }
    $('.message').html('Hai cercato il valore <b>' + obj.input + '</b>');
    $('input[name="cerca"]').val('').focus();
    $.each(obj.res, function(index, item) {
        data = item.data.split("-");
        //console.log(data);
        $('#result').append(
            '<div class="gomma">' +
            '<p class="numero">' + item.gomma + '</p>' +
            '<p class="contenuto">' + item.articolo + ' ' + item.extra + '</p>' +
            '<p class="data">' + data[0] + '</p>' +
            '</div>'
        );
    });
}

/**
 * Funzione di switch tab
 * quando clicco su un tab, viene chiamata questa funzione. Nasconde gli altri tab e visualizza quello selezionato, salvando la scelta nei cookies.
 * */
function attivotab(e) {

    //svuoto la sezione dei risultati
    $('#result,#aggiorna,.message').empty();

    //questo è il check per menu principale
    if ($(this).parents('nav').hasClass('main')) {
        $('nav.main li>a').removeClass('active');
        secname = this.innerText;
        $('.tabs').removeClass('visibile');
        $('#' + secname.toLowerCase()).addClass('visibile');
        setCookie("tabs", secname, 1);
    }
    //questo è il check per il submenu
    else {
        $('nav.sub li>a').removeClass('active');
        $('.subtabs').removeClass('visibile');
        subsec = this.innerText;
        $('#' + subsec.toLowerCase()).addClass('visibile');
    }
    $(this).addClass('active');

    // nascondo il menu humburger
    if ($('.humburger').is(":visible")) {
        $('nav ul').toggle();
    }
    console.log("Attivo TAB: " + this.innerText);
}

/**
 * https://www.w3schools.com/js/js_cookies.asp
 * Set Cookie & Get Cookie
 */
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function cookietabs() {
    console.log(cookietab);
    console.log(cookietab.toLowerCase());
    $('.tabs').removeClass('visibile');
    $('#' + cookietab.toLowerCase()).addClass('visibile');
    $('nav.main li>a').removeClass('active');
    $('nav.main li>a:contains(' + cookietab.toLowerCase() + ')').addClass('active');
}




/**  NON IN USO
 * Questa funzione controlla per ogni campo input in cui viene inserito il valore pattern
 * se questo è vero o falso,  in tal caso cancella l'ultimo carattere inserito.
 * */
function handleInput(event) {
    var value = this.value;
    if (new RegExp(this.pattern).test(value)) {
        this.value = value.slice(0, -1)
    }
}



function soloNumeri(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode //189
    if ((charCode > 47 && charCode < 57) || charCode == 46) {
        return true;
    }
    return false;
}