 async function getProducts(){
    try {
        const data = await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/"
        );
        const res = await data.json(data)

        // ---------LOCALSTORAGE

        window.localStorage.setItem("products", JSON.stringify(res))

    
        return res
    } catch (error) {
        console.log(error);
    }
}


function printProducts(db){
    const productsHTML = document.querySelector(".products");
    let html = "";
    
    const { products }  = db;

    for (const product of products){
        
        const buttonAdd =product.quantity
             ? `<i class='bx bx-plus' id='${product.id}'></i>`
             : '<span class="soldOut">sold out </span>'

        //template string-acento grave
        html += `
        <div class="product">
            <div class="product__img">
                <img src="${product.image}" alt="imagen"/>
            </div>
        
            <div class="product__info">
                <h4>${product.name} | <span><b>Stock</b>: 
                ${product.quantity}</span></h4>
                <h5>
                    $${product.price}
                    ${buttonAdd}
                </h5>
            </div>

            
        </div>`;
        productsHTML.innerHTML= html;
    }

    
}



// ---------CART
function handleShowCart(){
        const   iconCartHTML = document.querySelector(".bx-cart");
        const cartHTML = document.querySelector(".cart");
    
        let count = 0;
        iconCartHTML.addEventListener("click", function(){
            cartHTML.classList.toggle('cart__show')
    })

}



//-------ADD TO CART
function AddtoCartFromProducts(db){
     const productsHTML = document.querySelector(".products");

     productsHTML.addEventListener("click", function (e) {
         if(e.target.classList.contains('bx-plus')){
             const id = Number(e.target.id);
 
 
 
             // Let productFind = null
 
             // for (const product of db.products){
             //     if(product.is===id){
             //         productFint = product;
             //         break
             // }
 
             const productFind = db.products.find((product) => product.id === id);
 
             if(db.cart[productFind.id]){
                 if (productFind.quantity === db.cart[productFind.id].amount) return alert ("Ya no hay más en bodega");
 
                 db.cart[productFind.id].amount++;
             } else {
                 db.cart[productFind.id] = { ...productFind, amount:1};
             }
 
 
     //--------PERSISTENCIA
 
             window.localStorage.setItem("cart", JSON.stringify(db.cart)
             )
             
             printProductsInCart(db);
             printTotal(db);
             handlePrintAmountProducts(db)
 
         
         }
     });
}



//--------PRINT CART
function printProductsInCart(db){
    const cartProducts = document.querySelector(".cart__products");

    let html = "";
    for (const product in db.cart) {
        const {quantity, price, name, image, id, amount} = db.cart[product];

        console.log({ quantity, price, name, image, id, amount });

        html += `
            <div class="cart__product">
                <div class="cart__product--img">
                    <img src="${image}" alt="imagen"/>
                </div>

                <div class="cart__product--body">
                    <h4>${name} | ${price}</h4>
                    <p>Stock: ${quantity} - ${amount} unit</p>
                    <div class="cart__product--body-op" id='${id}'>
                        <span>$ ${amount*price}</span>
                        <i class='bx bx-minus' ></i>
                        <span>${amount} unit</span>
                        <i class='bx bx-plus' ></i>
                        <i class='bx bx-trash' ></i>
                    </div>
                </div>
        
            </div>
        `;
        }
    

    cartProducts.innerHTML= html;
}


//---------HANDLE CART

function handleProductsInCart(db){
    const cartProducts = document.querySelector(".cart__products");

    cartProducts.addEventListener("click", function (e) {
        if(e.target.classList.contains("bx-plus")){
        const id= Number(e.target.parentElement.id);

        const productFind = db.products.find((product) => product.id === id);

        if (productFind.quantity === db.cart[productFind.id].amount) return alert ("Ya no hay más en bodega");
        
        db.cart[id].amount++;
        }

        if(e.target.classList.contains("bx-minus")){
        const id= Number(e.target.parentElement.id);
        
        if (db.cart[id].amount === 1){
            const response = confirm('seguro que lo quieres aliminar?')
            if (!response)return;
            delete db.cart[id];
        } else { 
        db.cart[id].amount--;
        }
        }

        if(e.target.classList.contains("bx-trash")){
        const id= Number(e.target.parentElement.id);

        const response = confirm('seguro que lo quieres aliminar?')
            if (!response)return;

        delete db.cart[id];
        }

        window.localStorage.setItem("cart", JSON.stringify(db.cart))
        printProductsInCart(db);
        printTotal(db);
        handlePrintAmountProducts(db)
    });
}


function printTotal(db){
    const infoTotal = document.querySelector(".info__total");
    
    const infoAmount = document.querySelector(".info__amount");

    let totalProducts = 0;
    let amountProducts = 0;

    for (const product in db.cart) {
        const {amount, price} = db.cart[product];
        totalProducts += price * amount;
        amountProducts += amount;
    }

    infoAmount.textContent = amountProducts + " units";
    infoTotal.textContent = "$" + totalProducts + ".00";
}

function handleTotal(db){
    const btnBuy = document.querySelector(".btn__buy");

    btnBuy.addEventListener("click", function (){
    if (!Object.values(db.cart).length)
    return alert("carrito vacio");

    const response = confirm('seguro que desea comprar?');
    if (!response)return;

    const currentProducts = [];

    for (const product of db.products){
        const productCart = db.cart[product.id];
        if (product.id === productCart?.id){
            currentProducts.push({
                ...product,
                quantity: product.quantity - productCart.amount,
            });
        } else {
            currentProducts.push(product);
        }
    }

    db.products = currentProducts;
    db.cart = {};

    window.localStorage.setItem("products", JSON.stringify(db.products));
    window.localStorage.setItem("cart", JSON.stringify(db.cart));
    printTotal(db);
    printProductsInCart(db);
    printProducts(db);
    handlePrintAmountProducts(db)
});
}

function handlePrintAmountProducts(db){
    const amountProducts = document.querySelector(".amountProducts");

    let amount = 0;

    for (const product in db.cart){
        amount += db.cart[product].amount;

        amountProducts.textContent = amount;
    }

}

// ---------MAIN
async function main(){

    const db = {
        products: JSON.parse(window.localStorage.getItem("products"))||await getProducts(),
        cart:JSON.parse(window.localStorage.getItem('cart'))||{},
    };


    printProducts(db);
    handleShowCart();
    AddtoCartFromProducts(db);
    printProductsInCart(db);
    handleProductsInCart(db);
    printTotal(db);
    handleTotal(db);
    handlePrintAmountProducts(db);

    const  buttons = document.querySelectorAll(".buttons .btn");

    buttons.forEach(function(button){
    button.addEventListener('click', function(e){
        const filter = e.target.id;
        if(filter === 'all'){
            printProducts(db);

        } else {
            const filteredProducts = db.products.filter(function(product){ return product.category === filter;});
            
            printProducts({ products: filteredProducts });
        }
    });
});

    setTimeout(() => {
    const loaderHTML = document.querySelector("#loader");
    loaderHTML.classList.add("loader__hiden");
    document.body.classList.remove("hidden");
     }, 1000);


}




main();