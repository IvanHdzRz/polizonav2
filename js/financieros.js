'use strict'
 
const loader=document.getElementById("loader");
const dashboard=document.getElementById("dashboardData");

const fetchData= async()=>{
    try{
        //consulta datos desde el servidor
        const req=await fetch("http://polizona.com/mercado/22/php/financieros.php");
        const data=await req.json();
        //caluclo de indicadores financieros
        const materiaPrimaTotal=data.insumos.reduce((acc,insumo)=>parseInt(insumo.costo_total)+acc,0);
        const capacidadProduccion=Math.min( ...data.insumos.map(insumo=>parseInt (insumo.unidades)/parseInt( insumo.unidades_requeridas_por_producto)));
        const constoProduccionUnitario =data.insumos
            .reduce((acc,insumo)=>
                parseFloat(insumo.costo_unitario_promedio)*parseFloat(insumo.unidades_requeridas_por_producto)+acc 
            ,0)

        //quita el spinner de loading
        loader.style.display="none";
        
        //render, muestra html en base a calculo de indicadores
        dashboard.innerHTML+=`
            <div class="empresaInfo">
                <h3>empresa 22</h3>
                <p class="industriaName"> ${data.industria[0].nbindustria}</p>
            </div>
            <section>
                <h2 class="sectionTitle">
                    Generales
                </h2>
                <div class="cardContainer">
                    ${cardFinantial("materia prima en almacen",`$ ${materiaPrimaTotal}`,"http://polizona.com/mercado/22/assets/tape 1.png")}
                    ${cardFinantial("capacidad de produccion",`${Math.floor (capacidadProduccion)} pzs`,"http://polizona.com/mercado/22/assets/manufacture 1.png")}
                    ${cardFinantial("Costo de materia prima directa por unidad producida",`$ ${Math.round(constoProduccionUnitario)}`,"http://polizona.com/mercado/22/assets/competition 1.png")}
                </div>
                <h2 class="sectionTitle">Datos de Mercado</h2>
                    <div class="cardContainer">
                        ${cardMarket(
                            "competidor mas barato",
                            `${data.costos_de_produccion_competidores[0].id_competidor}`,
                            "graphComp",
                            `la empresa ${data.costos_de_produccion_competidores[0].id_competidor} presenta el costo de materia prima mas bajo de toda la ${data.industria[0].nbindustria} `)
                        }
                        
                        
                    </div>
                

                <h2 class="sectionTitle">
                    Raw data
                </h2>
                <div id="codeEditor">

                </div>
            </section>
        `;
        
        //incrustracion de elementos graficos externos (code mirror y graph js)
        const codeEditorContainer=document.getElementById("codeEditor");
        const codeEditor=CodeMirror(codeEditorContainer,{
        
            value:JSON.stringify(data,null,'\t'),
            
            theme:"seti",
            lineNumbers:true,
            styleActiveLine:true,
           
        });

        createGraph(
            'graphComp',
            'Costos de produccion competencia',
            data.costos_de_produccion_competidores.map(comp=>comp.costo_de_produccion),
            data.costos_de_produccion_competidores.map(comp=>comp.id_competidor)
        );

        
        


    }catch(e){alert}
    
}



fetchData();

function cardFinantial (title,value,icon){
    const markup=`
        <div class="cardIndicator">
            <p class="cardTitle">${title}</p>
            <img src="${icon}" class="cardIcon" alt="icon"/>
            <h2 class="cardValue">${value}</h2>
        </div>
    `
    return markup;
}

function cardMarket (title,value,idGrah,comment){
    const layoutCard=`
        <div class="cardMarket">
            <div class="marketResult">
                <h3>${title}</h3>
                <h2>${value}</h2>
                <p>${comment}</p>
            </div>
            <div class="graph">
                
                <canvas id="${idGrah}"></canvas>
            </div>
        </div>
    
    `;
    return layoutCard;
} 

function createGraph(idGraph,title,xData,yData){
    const ctx = document.getElementById(idGraph).getContext('2d');
        const chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'horizontalBar',

            // The data for our dataset
            data: {
                labels: yData,
                datasets: [{
                    label: title,
                    backgroundColor: 'rgba(166,68,177,0.5)',
                    borderColor: '#7444B1',
                    data: xData,
                    
                }]
            },

            // Configuration options go here
            options: {}
        });
}
