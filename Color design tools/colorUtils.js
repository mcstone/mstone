//javascript color plotting routines, using D3
//class, needs a chroma color to initialize
 class colorItem = {
	constructor (color, selected=false, name ="", group = [], notes= ""){
		this.lab = chroma.lab()
		this.hex = chroma.hex()
		this.selected = selected
		this.name = name
		this.group = group
		this.notes = notes
	}
 }
state = {}
state.colors = []
state.hex = []



