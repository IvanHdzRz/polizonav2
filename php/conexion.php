<?php 
    header('Access-Control-Allow-Origin: *');
    $hostname_localhost ="68.70.164.26";
    $database_localhost ="polizona_22";
    $username_localhost ="polizona_22";
    $password_localhost ="EL-22-me-toca";
    
    
    $conexion = mysqli_connect($hostname_localhost,$username_localhost,$password_localhost,$database_localhost);
    $resultado=mysqli_query($conexion,'select idEmpresa,industria,clientes from balances');

    $responce = array();
    if ($conexion) {
        $tempArray = array();
        while ($registro=mysqli_fetch_assoc($resultado)) {
            $tempArray = $registro;
            array_push($responce, $tempArray);
        }
    echo json_encode($responce);
    }else{
        echo json_encode("error");
    }

    
    

?>