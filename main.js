// html'in yüklenme anı
document.addEventListener("DOMContentLoaded", fetchCategories);
const basketBtn = document.querySelector("#basket");
const closeBtn = document.querySelector("#close");
const modal = document.querySelector(".modal-wrapper");
const basketList = document.querySelector("#list");
const totalSpan = document.querySelector("#total-price");
const totalAmount = document.querySelector("#count");
const sepetAmount = document.querySelector("#basket-notification");
const bildirimMesaj = document.querySelector(".container");
const kayitBtn = document.querySelector("#kayit");
const kayitcloseBtn = document.querySelector(".delete");
const kayitForm = document.querySelector(".kayit-form");

// yaptığımız ,isteklerin tamamında buulunur:
const baseUrl = "https://api.escuelajs.co/api/v1";

/*
 * kategori bilgilerini alma
 * 1- Api'ye istek at
 * 2- gelen veriyi işle
 * 3- gelen verileri kart şeklinde ekrana basıcak fonksiyonu çalıştır
 * 4- cevab hatalı olursa kullanıcıyı bilgilendir
 */

const categoryList = document.querySelector(".categories");

function renderCategories(categories) {
  // kategoriler dizisindeki herbir obje için çalışır
  categories.forEach((category) => {
    // 1- div oluşturma
    const categoryDiv = document.createElement("div");
    // 2- dive class ekleme
    categoryDiv.classList.add("category-card");
    // 3- divin içeriğini belirleme
    categoryDiv.innerHTML = `
    <img src=${category.image} />
    <p>${category.name}</p>
    `;
    // 4- elemanı htmlde categories div'ine ekleme
    categoryList.appendChild(categoryDiv);
  });
}

function fetchCategories() {
  fetch(`${baseUrl}/categories`)
    // eğerki cevapolumlu gelirse çalışır
    .then((res) => res.json())
    // veri json formatına dönünce çalışır
    .then((data) => renderCategories(data.slice(1, 5)))
    // cevapta hata varsa çalışır
    .catch((err) => console.log(err));
}

const productsContainer = document.querySelector(".kart-container");

function renderProducts(products) {
  products.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("kart-item");
    productItem.innerHTML = `
      <img class="kart-item-img" src=${product.images[0]} />
      <div class="kart-item-detay">
        <h5 class="kart-item-detay-title">
          ${product.title}
        </h5>
        <h6>${product.description}</h6>
        <div class="sepet">
          <p class="price">$${product.price}</p>
          <button onclick="addToBasket({id:${product.id},title: '${product.title}',price:${product.price},img:'${product.images[0]}',amount:1})">Sepete Ekle</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(productItem);
  });
}

function fetchProducts() {
  fetch(`${baseUrl}/products`)
    .then((res) => res.json())
    .then((data) => renderProducts(data.slice(0, 10)))
    .catch((err) => console.log(err));
}

fetchProducts();

// Sepet işlemleri

// Modal işlemleri

let basket = [];
let total = 0;

basketBtn.addEventListener("click", () => {
  modal.classList.add("active");

  renderBasket();
  if (basketList.innerHTML.trim() === "") {
    // List div'inin içeriği boş
    const sepetBos = document.createElement("div");
    sepetBos.classList.add("empty-basket-message");
    sepetBos.innerHTML = `Sepetiniz boş, alışveriş yapın.`;
    basketList.appendChild(sepetBos);
    return;
  }
});

closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

function addToBasket(product) {
  // aynı ürün tekrar eklendiyse miktarını arttırır

  const found = basket.find((i) => i.id === product.id);

  if (found) {
    found.amount++;
  } else {
    basket.push(product);
  }

  // Sepete eklenen ürünlerin sayısını güncelleyen kod

  const amount = basket.reduce((sum, urun) => sum + urun.amount, 0);

  sepetAmount.innerText = amount;

  bildirimGoster(`${product.title}`);

  // console.log(product);
}

function urunArttir(artisMiktari) {
  return artisMiktari + 1;
}

function arttirMiktar(urunId) {
  const found = basket.find((i) => i.id === urunId);

  if (found) {
    found.amount = urunArttir(found.amount);
    renderBasket();
    calculateTotal();
  }
}

function renderBasket() {
  const cardsHTML = basket
    .map((product) => {
      const urunMiktari = product.amount;
      return `
        <div class="item">
          <table id="cart">
            <thead>
              <tr>
                <th>Ürün Fotoğrafı</th>
                <th>Ürün Adı</th>
                <th>Fiyat</th>
                <th>Ürün Adeti</th>
                <th>Sil</th>
              </tr>
            </thead>
            <tbody>
              <td class="product-image">
                <img src="${product.img}" alt="${product.image} Ürün Fotğrafı" />
              </td>
              <td>${product.title}</td>
              <td>$${product.price}</td>
              <td>
                <button onClick="urunAzalt(${product.id})">-</button>
                <span class="deger">${urunMiktari}</span>
                <button onClick="arttirMiktar(${product.id})")">+</button>
              </td>
              <td>
                <img onClick="deleteItem(${product.id})" id="delete" src="images/trash.png" alt="Ürünü sil" />
              </td>
            </tbody>
          </table>
        </div>
      `;
    })
    .join(" ");

  basketList.innerHTML = cardsHTML;
  calculateTotal();
}

function urunAzalt(urunId) {
  const found = basket.find((i) => i.id === urunId);

  if (found && found.amount > 1) {
    found.amount--;
  } else if (found && found.amount === 1) {
    // Ürün miktarı 1'in altına düştüğünde, ürünü sepetten çıkar
    const index = basket.indexOf(found);
    if (index !== -1) {
      basket.splice(index, 1);
    }
  }

  renderBasket();
  calculateTotal();
}

function calculateTotal() {
  const sum = basket.reduce((sum, i) => sum + i.price * i.amount, 0);
  const amount = basket.reduce((sum, urun) => sum + urun.amount, 0);

  totalSpan.innerText = sum;
  totalAmount.innerText = amount + " Ürün ";
  sepetAmount.innerText = amount;
}

// Ürün silme fonksiyonu

function deleteItem(deleteid) {
  basket = basket.filter((i) => i.id !== deleteid);

  // listeyi güncelle
  renderBasket();

  // toplamı güncelle
  calculateTotal();
}

// Sepete eklendi fonksiyonu

function bildirimGoster(mesaj) {
  const bildirimKutusu = document.createElement("div");

  bildirimKutusu.classList.add("rectangle");

  bildirimKutusu.innerHTML = `         
   <div class="notification-text">
  <i class="fa fa-info-circle"> </i>
  <i style="margin-left: 5px">${mesaj}
  </i> <p style="margin-left: 8px"> sepete eklendi</p>
</div>
`;

  bildirimMesaj.appendChild(bildirimKutusu);
  setTimeout(() => {
    bildirimKutusu.style.display = "none";
  }, 3000);
}

// Kayıt formu açılış kapanış

kayitBtn.addEventListener("click", () => {
  kayitForm.classList.add("current");
});

kayitcloseBtn.addEventListener("click", () => {
  kayitForm.classList.remove("current");
});

/* 

eklenecek özellikler

sepet boşşsa anasayfadan alışveriş yapın

miktarı birden fazlaysa sildiğinde miktarı düşürsün

"+" "-" butonlarıyla miktarı arrtırıp azaltma

sepet kısmında bildirim kutucuğu

sepete eklenince sepete eklendi alerti

kayıt ol butonuna form gönderme ve başarıyla kayıt olundu

şifre ve kullanıcı adını localhistoricte tutma

ürün ismi giriniz inputu özelleştirme

*/
