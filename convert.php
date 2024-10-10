<?php

/*
da terminale utilizzo 
sqlite3 cas20211103.db .dump > dump.sql
nella cartella dove è presente il file sql e lo converte automaticamente.
Poi pulisco il file dump per essere correttamente caricato.

try {
  //open the database SQLlite
	//open the database
  $lite = new PDO('sqlite:cas.db');
  //select all data from the table
  $select = $lite->prepare('SELECT * FROM gomme ORDER BY id');
  $select->execute();

$result = $select->fetchAll(PDO::FETCH_ASSOC);
foreach ($result as $e) {
  echo 'INSERT INTO gomme VALUES('.$e['id'].','.$e['gomma'].','.$e['articolo'].','.$e['extra'].','.$e['data'].');'/n;
    //echo 'Articolo: ' . $entry['articolo'] . '  Extra: ' . $entry['extra'];
}
  // close the database connection
  $lite = NULL;
}
catch (PDOException $e) {
  print 'Exception : ' . $e->getMessage();
}
?>