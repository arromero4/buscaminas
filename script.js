
let filas = 10
let columnas = 10
let lado = 30
let marcas = 0
let minas = filas * columnas * 0.1
let enJuego = true
let juegoIniciado = false
let tablero = []

nuevoJuego()

function nuevoJuego() {
  reiniciarVariables()
  generarTableroHTML()
  generarTableroJuego()
  añadirEventos()
  
  refrescarTablero()

}

async function ajustes() {
  const {
    value: ajustes
  } = await swal.fire({
    title: "Ajustes",
    html: `
            Dificultad &nbsp; (minas/área)
            <br>
            <br>
            <input onchange="cambiarValor()" oninput="this.onchange()" id="dificultad" type="range" min="10" max="40" step="1" value="${100 * minas / (filas * columnas)}" onchange="">
            <span id="valor-dificultad">${100 * minas / (filas * columnas)}%</span>
            <br>
            <br>
            Filas
            <br>
            <input class="swal2-input" type="number" value=${filas} placeholder="filas" id="filas" min="10" max="1000" step="1">
            <br>
            Columnas
            <br>
            <input class="swal2-input" type="number" value=${columnas} placeholder="columnas" id="columnas" min="10" max="1000" step="1">
            <br>
            `,
    confirmButtonText: "Establecer",
    cancelButtonText: "Cancelar",
    showCancelButton: true,
    preConfirm: () => {
      return {
        columnas: document.getElementById("columnas").value,
        filas: document.getElementById("filas").value,
        dificultad: document.getElementById("dificultad").value
      }
    }
  })
  if (!ajustes) {
    return
  }
  filas = Math.floor(ajustes.filas)
  columnas = Math.floor(ajustes.columnas)
  minas = Math.floor(columnas * filas * ajustes.dificultad / 100)
  nuevoJuego()
}

function reiniciarVariables(){
  marcas = 0
  enJuego = true
  juegoIniciado = false
}

function generarTableroHTML() {
  let html = ""
  for (let f = 0; f < filas; f++) {
    html += `<tr>`
    for (let c = 0; c < columnas; c++) {
        /*
      Generar de cada uno de los elementos de la matriz
      Se asignara una coordenada con celda-${c}-${f}

    */
      html += `<td id="celda-${c}-${f}" style="width: ${lado}px; height: ${lado}px;">`
      html += `</td>`
    }
    html += `</tr>`
  }

  let tableroHTML = document.getElementById("tablero")
  tableroHTML.innerHTML = html
  tableroHTML.style.width = columnas * lado + "px"
  tableroHTML.style.height = filas * lado + "px"
  tableroHTML.style.background = "slategray"
}

//añadir eventos del mouse a cada celda
function añadirEventos() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`)
      celda.addEventListener("dblclick", (me) => {
        dobleClic(celda, c, f, me)
      })
      celda.addEventListener("mouseup", (me) => {
        clicSimple(celda, c, f, me)
      })
    }
  }
}

//funcion para descubrir celda
function dobleClic(celda, c, f, me) {
  if (!enJuego) {
    return
  }
  abrirArea(c, f)
  refrescarTablero()
}

//funcion para marcar celda
 function clicSimple(celda, c, f, me) {
      if (!enJuego) {
        return //El juego ha finalizado
      }
      if (tablero[c][f].estado == "descubierto") {
        return //Las celdas descubiertas no pueden ser redescubiertas o marcadas
      }
      switch (me.button) {
        case 0: //0 es el código para el clic izquierdo
          if (tablero[c][f].estado == "marcado") { //la celda está protegida
            break
          }
          /*
              Hay que proteger que la primera jugada no sea justo en una mina
              para no desmotivar al jugador con un castigo a la primera jugada

              Estimo que no le tomará más de 2 iteraciones en arreglar el problema
          */
          while (!juegoIniciado && tablero[c][f].valor == -1) {
            generarTableroJuego()
          }
          tablero[c][f].estado = "descubierto"
          juegoIniciado = true //aquí se avisa que el jugador ha descubierto más de 1 celda
          if (tablero[c][f].valor == 0) {
            /*
                                    Si acertamos en una celda que no tenga minas alrededor, entonces hay que 
                                    destapar toda el área de ceros
                                */
            abrirArea(c, f)
          }
          break;
        case 1: //1 es el código para el clic medio o scroll
          break;
        case 2: //2 es el código para el clic derecho
          if (tablero[c][f].estado == "marcado") {
            tablero[c][f].estado = undefined
            marcas--
  
          } else {
            tablero[c][f].estado = "marcado"
            marcas++

          }
          break;
        default:
          break;
      }
      refrescarTablero()
    }

function abrirArea(c, f){
  //abrir los demás celdas alrededor
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if(i == 0 && j == 0){
        continue
      }
      try{
        if(tablero[c+i][f+j].estado != "descubierto"){
        if(tablero[c+i][f+j].estado != "marcado"){
          tablero[c+i][f+j].estado = "descubierto"
          if(tablero[c+i][f+j].valor == 0){
          abrirArea(c+i, f+j)
          }
        }
      }
      }catch(e){}        
    }
  }
}

//seguimiento visual
function refrescarTablero() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let celda = document.getElementById(`celda-${c}-${f}`)

      if (tablero[c][f].estado == "descubierto") {
        celda.style.boxShadow = "none"
        switch (tablero[c][f].valor) {
          case -1:
            celda.innerHTML = `<i class="fas fa-bomb"></i>`
            celda.style.color = "black"
            celda.style.background = "white"
            break;
          case 0:
            break
          default:
            celda.innerHTML = tablero[c][f].valor
            break;
        }
      }

      if (tablero[c][f].estado == "marcado") {
        celda.innerHTML = `<i class="fas fa-flag"></i>`
        celda.style.background = `cadetblue`
      }
      if (tablero[c][f].estado == undefined) {
        celda.innerHTML = ``
        celda.style.background = ``
      }
    }
  }
  verificarGanador()
  verificarPerdedor()
  actualizarPanelMinas()
}

//actualizar
function actualizarPanelMinas() {
  let panel = document.getElementById("minas")
  panel.innerHTML = minas - marcas
}

//verificar si el jugador es ganador o perdedor
function verificarGanador(){
  //verificar que todas las minas esten marcadas
  //y las demás celdas esten descubiertas
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if(tablero[c][f].estado != "descubierto"){//si la mina está descubierta
        if(tablero[c][f].valor == -1){//y es una mina
          continue
        }else{
          //si encuentra una celda cubierta, que no sea mina, el jugador no ha ganado todavía
          return
        }
      }
    }
  }
  //si llega hasta aquí, el jugador ganó
  let tableroHTML = document.getElementById("tablero")
  tableroHTML.style.background = "green"
  enJuego = false
}
function verificarPerdedor(){
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      //si hay una mina, y esta descubierta, el jugador perdió
      if(tablero[c][f].valor == -1){
        if(tablero[c][f].estado == "descubierto"){
          let tablero = document.getElementById("tablero")
          tablero.style.background = "red"
          enJuego = false
        }

      }
    }
  }
  
  if(enJuego){
    return
  }
  
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if(tablero[c][f].valor == -1){
        let celda = document.getElementById(`celda-${c}-${f}`)
        celda.innerHTML = "💣"
        celda.style.color = "black"
      }
    }
  }
}

//seguimiento logico
function generarTableroJuego() {
  vaciarTablero()//vaciar el tablero
  ponerMinas()//minas -1
  contadoresMinas()//pistas
}

// pone el tablero en un estado inicial
function vaciarTablero() {
  tablero = []
  for (let c = 0; c < columnas; c++) {
    tablero.push([])
  }
}

function ponerMinas() {
  for (let i = 0; i < minas; i++) {
    let c
    let f
    do {
      c = Math.floor(Math.random() * columnas)
      f = Math.floor(Math.random() * filas)
    } while (tablero[c][f]) //verifica que no hay mina en la celda
    tablero[c][f] = { valor: -1 }//se inserta la mina en la celda disponible
  }
}

function contadoresMinas() {
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (!tablero[c][f]) {
        let contador = 0
        //Se van a recorrer todas las celdas que están al rededor de la misma, 8 en total
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) {
              continue
            }
            try { //hay que evitar errores con las posiciones negativas
              if (tablero[c + i][f + j].valor == -1) {
                contador++
              }
            } catch (e) {}
          }
        }
        tablero[c][f] = {
          valor: contador
        }
      }
    }
  }
}