<?php

require('../wp-config.php');

$db = new db(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
$output['act']=gps('action');
$output['input']=gps($output['act']);




/* FUNZIONE PRINCIPALE
* In base al valore passato tramite il campo input presente nel foglio html, gestisco quale operazione effettuare attraverso il database.
*/
if($output['act']=="cerca"){
	//sostituisco gli asterischi con il %
	$input=str_replace('*','%',$output['input']);
	$output['res'] = $db->query("SELECT * FROM gomme where articolo like '".$input."' or extra like '".$input."' order by data")->fetchAll();
}
//cerca la gomma da modificare
if($output['act']=="modifica"){
	$output['res'] = $db->query("SELECT * FROM gomme where gomma ='".$output['input']."'")->fetchAll();
}
//aggiorna la gomma da modificare
if($output['act']=="aggiorna"){
	$output['rows']=gps('row');
	$array=array('risultato'=>'Gomma modificata');
	$i=0;
	foreach($output['rows'] as $r){
		if($r['id']=='new'){
			if($db->query('
				INSERT INTO gomme (gomma,articolo,extra,data) VALUES ("'.$output['input'].'","'.$r['articolo'].'","'.$r['extra'].'",now())')){
				$array[$i]="Inserita riga sulla gomma ".$output['input'];
			}
			$i++;
		}else{
			if($db->query('UPDATE gomme SET articolo = "'.$r['articolo'].'",extra = "'.$r['extra'].'",data = now() WHERE id = "'.$r['id'].'"')){
				$array[$r['id']]="Aggiornata riga ".$r['id']." sulla gomma ".$output['input'];
			}
			
		}
	}
	
	$output['res'] =(object)$array;
}


//cancello la riga che mi invia la pagina perchè è presente un ID
if($output['act']=="delrig"){
	if($db->query("DELETE FROM gomme WHERE id = '".$output['input']."'")){
		$output['res']="la riga da cancellare è la numero ".$output['input'];
	}else{
		$output['res']="Errore";
	}
	
}


//if($output['act']=="numerogomma"){
if($output['act']=="inserisci"){
	$output['res'] = $db->query("SELECT gomma FROM gomme
where 1=1 ORDER BY gomma DESC LIMIT 1")->fetchArray();
}

//filtro gli articoli
if($output['act']=="filtra"){
	$output['rows']=gps('row');
	$row=gps('row');
	/* //controllo se l'attributo row è stato passato (significa che sono in fase di modica)
	if($row[upd]){
		if($db->query('UPDATE articoli SET descrizione = "'.$row['descrizione'].'",peso = "'.$row['peso'].'",prezzo = "'.$row['prezzo'].'",quantita = "'.$row['quantita'].'",modifica = now() WHERE articolo = "'.$output['input'].'"')){
			$array=array('risultato'=>'Articolo '.$output['input'].' modificato');
		}
	}else{
		/* if($db->query('UPDATE gomme SET articolo = "'.$r['articolo'].'",extra = "'.$r['extra'].'",data = now() WHERE id = "'.$r['id'].'"')){
			$array[$r['id']]="Aggiornata riga ".$r['id']." sulla gomma ".$output['input'];
		} 
	}
		//trasformo l'array in un oggetto
		$output['res'][0] =$array;
	
	*/
	//controllo se l'attributo row è stato passato (significa che sono in fase di modica)
	if(isset($row['upd'])){
		if($row['upd']){
			if($db->query('UPDATE articoli SET descrizione = "'.$row['descrizione'].'",peso = '.str_replace(",",".",$row['peso']).',prezzo ='.str_replace(",",".",$row['prezzo']).',quantita ='.$row['quantita'].',modifica = now() WHERE id = "'.$row['id'].'"')){
				//array_push($row,'risultato'=>'Articolo '.$output['input'].' modificato');
				$output['res'][0]=$row;

			}
		}
		else{
			if($db->query('INSERT INTO articoli (articolo,descrizione,peso,prezzo,quantita,modifica) VALUES ("'.$output['input'].'","'.$row['descrizione'].'",'.str_replace(",",".",$row['peso']).','.str_replace(",",".",$row['prezzo']).','.$row['quantita'].',now())')){
				//array_push($row,'risultato'=>'Articolo '.$output['input'].' inserito');
				$output['res'][0]=$row;
			}
		}
	}
	//altrimenti sono in fase di ricerca
	else{
		$input=str_replace('*','%',$output['input']);
	$check=str_replace('*','',$output['input']);
	if(is_numeric($check)){
		$output['res'] = $db->query('SELECT * FROM articoli where articolo LIKE "'.$input.'" ORDER BY articolo')->fetchAll();
	}else{
		$output['res'] = $db->query('SELECT * FROM articoli where descrizione LIKE "%'.$input.'%" ORDER BY articolo')->fetchAll();
	}

	}
	
	//}
}
/*
* FINE DELLA FUNZIONE PRICIPALE
*/




/*
** Da qui in avanti sono presenti tutte le funzioni necessarie
** per il corretto funzionamento del DB, la classe DB si occupa appunto di questo
*/

//Return the data back to form.php
echo json_encode($output);
// chiudi il DB alla fine della sessione di richieste
$db->close();
class db {
	//https://codeshack.io/super-fast-php-mysql-database-class/
    protected $connection;
	protected $query;
    protected $show_errors = TRUE;
    protected $query_closed = TRUE;
	public $query_count = 0;

	public function __construct($dbhost = 'localhost', $dbuser = 'root', $dbpass = '', $dbname = '', $charset = 'utf8') {
		$this->connection = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
		if ($this->connection->connect_error) {
			$this->error('Failed to connect to MySQL - ' . $this->connection->connect_error);
		}
		$this->connection->set_charset($charset);
	}

    public function query($query) {
        if (!$this->query_closed) {
            $this->query->close();
        }
		if ($this->query = $this->connection->prepare($query)) {
            if (func_num_args() > 1) {
                $x = func_get_args();
                $args = array_slice($x, 1);
				$types = '';
                $args_ref = array();
                foreach ($args as $k => &$arg) {
					if (is_array($args[$k])) {
						foreach ($args[$k] as $j => &$a) {
							$types .= $this->_gettype($args[$k][$j]);
							$args_ref[] = &$a;
						}
					} else {
	                	$types .= $this->_gettype($args[$k]);
	                    $args_ref[] = &$arg;
					}
                }
				array_unshift($args_ref, $types);
                call_user_func_array(array($this->query, 'bind_param'), $args_ref);
            }
            $this->query->execute();
           	if ($this->query->errno) {
				$this->error('Unable to process MySQL query (check your params) - ' . $this->query->error);
           	}
            $this->query_closed = FALSE;
			$this->query_count++;
        } else {
            $this->error('Unable to prepare MySQL statement (check your syntax) - ' . $this->connection->error);
        }
		return $this;
    }


	public function fetchAll($callback = null) {
	    $params = array();
        $row = array();
	    $meta = $this->query->result_metadata();
	    while ($field = $meta->fetch_field()) {
	        $params[] = &$row[$field->name];
	    }
	    call_user_func_array(array($this->query, 'bind_result'), $params);
        $result = array();
        while ($this->query->fetch()) {
            $r = array();
            foreach ($row as $key => $val) {
                $r[$key] = $val;
            }
            if ($callback != null && is_callable($callback)) {
                $value = call_user_func($callback, $r);
                if ($value == 'break') break;
            } else {
                $result[] = $r;
            }
        }
        $this->query->close();
        $this->query_closed = TRUE;
		return $result;
	}

	public function fetchArray() {
	    $params = array();
        $row = array();
	    $meta = $this->query->result_metadata();
	    while ($field = $meta->fetch_field()) {
	        $params[] = &$row[$field->name];
	    }
	    call_user_func_array(array($this->query, 'bind_result'), $params);
        $result = array();
		while ($this->query->fetch()) {
			foreach ($row as $key => $val) {
				$result[$key] = $val;
			}
		}
        $this->query->close();
        $this->query_closed = TRUE;
		return $result;
	}

	public function close() {
		return $this->connection->close();
	}

    public function numRows() {
		$this->query->store_result();
		return $this->query->num_rows;
	}

	public function affectedRows() {
		return $this->query->affected_rows;
	}

    public function lastInsertID() {
    	return $this->connection->insert_id;
    }

    public function error($error) {
        if ($this->show_errors) {
            exit($error);
        }
    }

	private function _gettype($var) {
	    if (is_string($var)) return 's';
	    if (is_float($var)) return 'd';
	    if (is_int($var)) return 'i';
	    return 'b';
	}

}

/**
 * Gets a HTTP GET or POST parameter.
 */
 
function gps($thing, $default = '')
{
    global $pretext;
 
    if (isset($_GET[$thing])) {
        $out = $_GET[$thing];
        $out = doArray($out, 'deCRLF');
    } elseif (isset($_POST[$thing])) {
        $out = $_POST[$thing];
    } elseif (is_numeric($thing) && isset($pretext[abs($thing)])) {
        $thing >= 0 or $thing += $pretext[0] + 1;
        $out = $pretext[$thing];
    } else {
        return $default;
    }
 
    $out = doArray($out, 'deNull');
 
    return $out;
}
function gpsa($array)
{
    if (is_array($array)) {
        $out = array();
 
        foreach ($array as $a) {
            $out[$a] = gps($a);
        }
 
        return $out;
    }
 
    return false;
}
function doArray($in, $function)
{
    if (is_array($in)) {
        return array_map($function, $in);
    }
 
    if (is_array($function)) {
        return call_user_func($function, $in);
    }
 
    return $function($in);
}
function deNull($in)
{
    return is_array($in) ? doArray($in, 'deNull') : strtr($in, array("\0" => ''));
}


