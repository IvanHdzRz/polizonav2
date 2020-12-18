<?php 
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    $hostname_localhost ="68.70.164.26";
    $database_localhost ="polizona_mercado";
    $username_localhost ="polizona_lectura";
    $password_localhost ="Polizona-1";
    
    $table=$_GET["select_table"];
    $field_1=$_GET["select_field_1"];
    $field_2=$_GET["select_field_2"];

    $sql_1="
        SELECT {$field_1} , COUNT(*)/(SELECT COUNT(*) FROM {$table}) AS 'probabilidad'  
        FROM {$table} 
        WHERE {$field_1} IN( SELECT DISTINCT {$field_1} FROM {$table}) 
        GROUP BY {$field_1};
    ";

    $sql_2="
        SELECT {$field_1} ,{$field_2} , COUNT(*)/(SELECT COUNT(*) FROM {$table}) AS 'probabilidad'  
        FROM {$table} 
        WHERE 
            {$field_1}   IN 
            (SELECT DISTINCT {$field_1}  FROM {$table}) AND 
            {$field_2} IN ( SELECT DISTINCT {$field_2} FROM {$table}) 
        GROUP BY {$field_2},{$field_1}  
        ORDER BY {$field_1} , {$field_2};
    ";

    $conexion = mysqli_connect($hostname_localhost,$username_localhost,$password_localhost,$database_localhost);
    
    $nivel1dataSet =mysqli_query($conexion,$sql_1);
    $nivel2dataSet=mysqli_query($conexion,$sql_2);
    $responce= array(
        "tabla"=>$table,
        "sqlGenerado"=>array("query1"=>$sql_1,"query2"=>$sql_2),
        "nivel1"=>toArray($nivel1dataSet,$conexion),
        "nivel2"=>toArray($nivel2dataSet,$conexion)
    );
    
    echo json_encode($responce,JSON_NUMERIC_CHECK);

    function toArray($dataSet,$conexion){
        if ($conexion) {
            $tempArray = array();
            $data=array();
            while ($registro=mysqli_fetch_assoc($dataSet)) {
                $tempArray = $registro;
                array_push($data, $tempArray);
            }
        
    
            return $data;
        }else{
           return "error";
        }
    }
    

?>