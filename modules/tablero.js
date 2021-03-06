"use strict";
const casilla = require("./casilla.js");
const elementos = require("./elementos.js");

class Tablero{
	constructor(nombre,columnas,filas){
		this._nombre = nombre;
		this._columnas = columnas-1;
		this._filas = filas-1;
		this._tablero = new Array(columnas);
		for (let x = 0;x<columnas;x++){
			this._tablero[x] = new Array(filas);
			for (let y=0;y<filas;y++){
				this._tablero[x][y] = new casilla(x,y);
			}
		}
		this._balas = new Map();
	}
	// ------ GETTERS ------ //
	get nombre(){
		return this._nombre;
	}
	get dimension(){
		return {filas:this._filas+1,columnas:this._columnas+1};
	}
	get tablero(){
		return this._tablero;
	}
	get info(){ //Sustituir < por <= debido al cambio realizado en las propiedades fila y columna
		let elem = [];	
		for (let x = 0;x<=this._columnas;x++){
			for (let y=0;y<=this._filas;y++){
				if(this._tablero[x][y].con != null){
					elem.push(this._tablero[x][y].con);
				}
			}
		}
		return elem;
	}
	// ------ Funciones ------ //
	// Funcion que inserta un objeto en una casilla en la fila y columna indicados
	insertar(objeto,columna,fila){
		if (fila>this._filas || fila<0 || columna>this._columnas || columna<0){
			console.log("Error: Fuera de rango");
		} else {
			console.log('insertando objeto '+ objeto.tipo+' en: col: '+columna+' fila: '+fila);
			this._tablero[columna][fila].con = objeto;
		}
	}
	// Funcion que devuelve el contenido de la casilla de delante del objeto
	casillaDelante(objeto){
		let pos = objeto.pos;
		switch (pos.o){
			case "norte":if(pos.y>0){return this._tablero[pos.x][pos.y-1]} else {return false};break;
			case "sur":if(pos.y<this._filas){return this._tablero[pos.x][pos.y+1]} else {return false};break;
			case "este":if(pos.x<this._columnas){return this._tablero[pos.x+1][pos.y]} else {return false};break;
			case "oeste":if(pos.x>0){return this._tablero[pos.x-1][pos.y]} else {return false};break;
			default: console.log("Eso no es una orientacion"); break;
		}
	}
	mover(objeto){
		let mov=(objeto.tipo=="tanque")?objeto.nombre:objeto.tipo
		console.log('Vamos a mover el '+mov+', posición actual: '+objeto.pos.x+','+objeto.pos.y+' orientacion: '+objeto.pos.o);
		let delante = this.casillaDelante(objeto);
		let posicion = objeto.pos;
		if (delante){
			console.log('Estamos dentro del tablero..');
			if(delante.con == null){
				console.log('No hay nada delante, me puedo mover');
				this.insertar(objeto,delante.pos.x,delante.pos.y);
				console.log(posicion)
				this._tablero[posicion.x][posicion.y].con = null;
			} else {
				if (objeto.tipo == "tanque"){
					
					if (delante.con.tipo == "tanque"){
						console.log('No me puedo mover, choqué con un tanque');
						delante.con.vida-=2;
						objeto.vida--;
					} else if (delante.con.tipo == "roca") {
						console.log('No me puedo mover, choqué con una roca');
						objeto.vida--;
					} else if (delante.con.tipo == "bala"){
						console.log('Me puedo mover, choqué con una bala');
						objeto.vida--;
						this._balas.delete(delante.pos);
						this.insertar(objeto,delante.pos.x,delante.pos.y);
						this._tablero[posicion.x][posicion.y].con = null;
					}
				} else if (objeto.tipo == "bala"){
					if (delante.con.tipo == "tanque"){
						delante.con.vida--;
						this._balas.delete(objeto.pos);
						this._tablero[posicion.x][posicion.y].con = null;
					} else if (delante.con.tipo == "roca") {
						this._balas.delete(objeto.pos);
						this._tablero[posicion.x][posicion.y].con = null;
					} else if (delante.con.tipo == "bala"){
						this._balas.delete(objeto.pos);
						this._balas.delete(delante.pos);
						this._tablero[delante.pos.x][delante.pos.y].con = null;
						this._tablero[posicion.x][posicion.y].con = null;
					}
				}
			}
		}else{
			console.log('Fuera del tablero');
		}
	}

	girar(objeto,direccion){
		let orientaciones = ["norte","este","sur","oeste"];
		let index = orientaciones.indexOf(objeto.pos.o);
		if(direccion=="derecha") {
			console.log('girando a la derecha..');
			objeto.o = (index==orientaciones.length-1) ? orientaciones[0]: orientaciones[index+1];
		}
		if(direccion=="izquierda") {
			console.log(objeto.pos.o + ' girando a la izquierda..');
			objeto.o = (index==0) ? orientaciones[orientaciones.length-1] : orientaciones[index-1];
		}
		return;
	}
	// esto es un comentario
	disparar(objeto){
		let delante = this.casillaDelante(objeto);
		let posicion = objeto.pos;
		if (objeto.muni>0){
			// Y esto es otro
			objeto.muni--;
			if(delante){
				if (delante.con == null){
					let bala = new elementos.bala(posicion.o)
					// Y aqui tienes otro mas
					this.insertar(bala,delante.pos.x,delante.pos.y);
					this._balas.set(bala.pos,bala);
				} else {
					if(delante.con.tipo=="tanque"){
						delante.con.vida--;
					}
					if(delante.con.tipo=="bala"){
						this._balas.delete(delante.pos);
						this._tablero[delante.pos.x][delante.pos.y].con = null;
					}
				}
			}
		}
	}
}
module.exports = Tablero;