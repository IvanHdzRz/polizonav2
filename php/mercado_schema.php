<?php 
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    $hostname_localhost ="68.70.164.26";
    $database_localhost ="information_schema";
    $username_localhost ="polizona_lectura";
    $password_localhost ="Polizona-1";
    
    
    $conexion = mysqli_connect($hostname_localhost,$username_localhost,$password_localhost,$database_localhost);
    
    $queryTables= '
    SELECT TABLE_NAME as nombre_tabla
    FROM TABLES
    WHERE TABLE_SCHEMA="polizona_mercado";
    ';

    $tablesDataSet= mysqli_query($conexion,$queryTables);
    $tables=array(
        "tablas"=>toArray($tablesDataSet,$conexion)
    );

    echo json_encode($tables);



    function toArray($dataSet,$conexion){
        if ($conexion) {
            $tempArray = array();
            $data=array();
            while ($registro=mysqli_fetch_assoc($dataSet)) {
                //se consulta los campos de cada tabla
                $queryCampos='
                    SELECT COLUMN_NAME AS campos 
                    FROM COLUMNS 
                    WHERE TABLE_SCHEMA = "polizona_mercado" AND TABLE_NAME ="'.$registro['nombre_tabla'].'"';
                
                $camposDataSet =mysqli_query($conexion,$queryCampos);
                
                //se crea array de campos
                $camposArray=array();
                while ($campos=mysqli_fetch_assoc($camposDataSet)) {
                    array_push($camposArray, $campos["campos"]);
                }

                //se agrega la tabla y sus campos al array
                $tempArray =array(
                    "nombre"=> $registro["nombre_tabla"],
                    "campos"=>$camposArray
                );
                array_push($data, $tempArray);
            }
        
    
            return $data;
        }else{
           return "error";
        }
    }

?>