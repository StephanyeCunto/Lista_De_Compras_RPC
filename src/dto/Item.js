export class Item{
    constructor(name,nameUpdate,quantity = 1,price = null, isPurchased = null){
        this.name = name;
        this.nameUpdate = nameUpdate;
        this.quantity = quantity;
        this.price = price;
        this.isPurchased = isPurchased;
    }

    getItem(){
        return [this.name, this.nameUpdate, this.quantity, this.price, this.isPurchased];
    }

    nameUpdate(){
        this.name = this.nameUpdate;
    }
}