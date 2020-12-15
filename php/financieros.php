<?php 
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    $hostname_localhost ="68.70.164.26";
    $database_localhost ="polizona_mercado";
    $username_localhost ="polizona_lectura";
    $password_localhost ="Polizona-1";
    
    
    $conexion = mysqli_connect($hostname_localhost,$username_localhost,$password_localhost,$database_localhost);
    
    $queryInsumos='
        select 
                e.idalmacen,tipoalmacen.nbtipoalmacen as insumo, sum(e.unidades) as "unidades",sum(e.costoembarque) as "costo_total",
                (sum(e.costoembarque)/sum(e.unidades)) as "costo_unitario_promedio", prov.proveedor, 
                prov.coeficiente as "unidades_requeridas_por_producto"
        
        from embarque as e
        inner join tipoalmacen on e.idalmacen=tipoalmacen.idtipoalmacen
        inner join 
            (select (enc.idvendedora-4) as insumo, industria.nbindustria as proveedor,enc.coeficiente 
            from encadenamiento as enc 
            inner join industria on industria.idindustria=enc.idvendedora
            where idcompradora= (select idindustria from empresa where idempresa=22)
            ) as prov on  prov.insumo=e.idalmacen
        
        where e.idempresa=22
        group by e.idalmacen;';
    $queryIndustria='
        Select indus.nbindustria 
        from empresa
        inner join industria as indus on indus.idindustria=empresa.idindustria
        where idempresa=22;
    ';
    $queryCostosCompetencia='
    SELECT costos.idempresa as id_competidor, TRUNCATE((SUM(costos.costo_unitario_promedio*costos.unidades_requeridas_por_producto)),3) as costo_de_produccion
    FROM
    (select 
      e.idempresa,e.idalmacen,tipoalmacen.nbtipoalmacen as insumo, sum(e.unidades) as "unidades",sum(e.costoembarque) as "costo_total",
      (sum(e.costoembarque)/sum(e.unidades)) as "costo_unitario_promedio", prov.proveedor, 
      prov.coeficiente as "unidades_requeridas_por_producto"
     
     from embarque as e
     inner join tipoalmacen on e.idalmacen=tipoalmacen.idtipoalmacen
     inner join 
        (select (enc.idvendedora-4) as insumo, industria.nbindustria as proveedor,enc.coeficiente 
         from encadenamiento as enc 
         inner join industria on industria.idindustria=enc.idvendedora
         where idcompradora= (select idindustria from empresa where idempresa=22)
        ) as prov on  prov.insumo=e.idalmacen
     
     where e.idempresa in 
     (
      SELECT idempresa 
      FROM empresa 
      WHERE idindustria = (select idindustria from empresa where idempresa=22) && 
        idempresa !=22 && idempresa <=50 
     ) 
     group by e.idalmacen, e.idempresa
      order by e.idempresa) as costos
    group by costos.idempresa
    order by costo_de_produccion;
    ';

    $queryCostosProveedores='
    SELECT costos_prov.idempresa as proveedor , (emp.idindustria-4) as id_insumo,alm.nbtipoalmacen as nombre_insumo ,costos_prov.costo_de_produccion FROM(SELECT costos.idempresa, TRUNCATE((SUM(costos.costo_unitario_promedio*costos.unidades_requeridas_por_producto)),3) as costo_de_produccion
    FROM
    (select 
      e.idempresa,e.idalmacen,tipoalmacen.nbtipoalmacen as insumo, sum(e.unidades) as "unidades",sum(e.costoembarque) as "costo_total",
      (sum(e.costoembarque)/sum(e.unidades)) as "costo_unitario_promedio", prov.proveedor, 
      prov.coeficiente as "unidades_requeridas_por_producto"
     
     from embarque as e
     inner join tipoalmacen on e.idalmacen=tipoalmacen.idtipoalmacen
     inner join 
        (select (enc.idvendedora-4) as insumo, industria.nbindustria as proveedor,enc.coeficiente 
         from encadenamiento as enc 
         inner join industria on industria.idindustria=enc.idvendedora
         where idcompradora= (select idindustria from empresa where idempresa=22)
        ) as prov on  prov.insumo=e.idalmacen
     
     where e.idempresa in 
     (
      SELECT idempresa as proveedores FROM empresa where idindustria in (
     select  industria.idindustria as id_proveedor 
         from encadenamiento as enc 
         inner join industria on industria.idindustria=enc.idvendedora
         where idcompradora= (select idindustria from empresa where idempresa=22) 
    ) && idempresa <=50 && idempresa !=22
        
     ) 
     group by e.idalmacen, e.idempresa
      order by e.idempresa) as costos
      
    group by costos.idempresa
    order by costo_de_produccion) AS costos_prov
    inner join empresa as emp on emp.idempresa= costos_prov.idempresa 
    inner join tipoalmacen as alm on emp.idindustria-4=alm.idtipoalmacen;
    ';

    $insumosSet=mysqli_query($conexion,$queryInsumos);
    $industriaSet=mysqli_query($conexion,$queryIndustria);
    $costosCompetenciaSet=mysqli_query($conexion,$queryCostosCompetencia);
    $costosProveedoresSet=mysqli_query($conexion,$queryCostosProveedores);
    $responce = array(
        "empresa"=>22,
        "industria"=>toArray($industriaSet,$conexion),
        "insumos"=> toArray($insumosSet,$conexion),
        "costos_de_produccion_competidores"=>toArray($costosCompetenciaSet,$conexion),
        "costos_de_produccion_proveedores"=>toArray($costosProveedoresSet,$conexion)
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