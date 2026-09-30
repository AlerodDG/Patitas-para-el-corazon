/**
 * Single Responsibility Principle (SRP)
 * Proveedor estático de datos de los perritos.
 */
class DogRepository {
    async getDogs() {
        return [
            {
                id: 1,
                nombre: "Canela",
                sexo: "Hembra",
                edad: "Cachorro",
                descripcion: "Cachorra juguetona y cariñosa. Fue rescatada junto a sus hermanos.",
                imagen: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 2,
                nombre: "Bruno",
                sexo: "Macho",
                edad: "Joven",
                descripcion: "Lleno de energía y muy obediente. Le encanta correr al aire libre.",
                imagen: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 3,
                nombre: "Mila",
                sexo: "Hembra",
                edad: "Adulto",
                descripcion: "Tranquila y noble. Excelente compañía para familias o adultos mayores.",
                imagen: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=500&q=80"
            },
            {
                id: 4,
                nombre: "Oreo",
                sexo: "Macho",
                edad: "Sénior",
                descripcion: "Muy paciente y dulce. Busca un hogar sereno para descansar y dar amor.",
                imagen: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80"
            }
        ];
    }
}

/**
 * SRP & OCP: Servicio de filtrado extensible por cualquier propiedad sin modificar el renderizado.
 */
class DogFilterService {
    static filter(dogs, criteria) {
        const { sexo, edad } = criteria;

        return dogs.filter(dog => {
            const matchesSex = (sexo === "todos" || dog.sexo.toLowerCase() === sexo.toLowerCase());
            const matchesAge = (edad === "todas" || dog.edad.toLowerCase() === edad.toLowerCase());
            return matchesSex && matchesAge;
        });
    }
}

/**
 * SRP: Generación de la interfaz HTML de las tarjetas de adopción.
 */
class DogCardRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(dogs, onAdoptClickCallback) {
        this.container.innerHTML = "";

        if (dogs.length === 0) {
            this.container.innerHTML = `
                <div class="no-results">
                    <p>No encontramos peluditos que coincidan con esos criterios. ¡Intenta cambiando los filtros!</p>
                </div>
            `;
            return;
        }

        dogs.forEach(dog => {
            const card = document.createElement("article");
            card.className = "dog-card";
            card.innerHTML = `
                <img src="${dog.imagen}" alt="Fotografía de ${dog.nombre}" class="dog-card__image">
                <div class="dog-card__body">
                    <div class="dog-card__header">
                        <h3 class="dog-card__title">${dog.nombre}</h3>
                        <span class="dog-card__badge">${dog.sexo}</span>
                    </div>
                    <p class="dog-card__info"><strong>Edad:</strong> ${dog.edad}</p>
                    <p class="dog-card__description">${dog.descripcion}</p>
                    <button class="btn btn-primary btn-full adopt-btn" data-id="${dog.id}">
                        Solicitar adopción
                    </button>
                </div>
            `;

            const adoptButton = card.querySelector(".adopt-btn");
            adoptButton.addEventListener("click", () => onAdoptClickCallback(dog));

            this.container.appendChild(card);
        });
    }
}

/**
 * SRP: Control exclusivo de la apertura, cierre y envío del formulario modal.
 */
class AdoptionModalHandler {
    constructor() {
        this.modal = document.getElementById("adoption-modal");
        this.closeBtn = document.getElementById("close-modal");
        this.dogNameElem = document.getElementById("modal-dog-name");
        this.dogIdInput = document.getElementById("selected-dog-id");
        this.form = document.getElementById("adoption-form");
        this.successMsg = document.getElementById("form-success-message");

        this.initEvents();
    }

    initEvents() {
        this.closeBtn.addEventListener("click", () => this.close());
        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) this.close();
        });

        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    open(dog) {
        this.dogNameElem.textContent = dog.nombre;
        this.dogIdInput.value = dog.id;
        this.form.reset();
        this.form.classList.remove("hidden");
        this.successMsg.classList.add("hidden");
        this.modal.classList.add("active");
        this.modal.setAttribute("aria-hidden", "false");
    }

    close() {
        this.modal.classList.remove("active");
        this.modal.setAttribute("aria-hidden", "true");
    }

    handleSubmit(e) {
        e.preventDefault();
        this.form.classList.add("hidden");
        this.successMsg.classList.remove("hidden");

        setTimeout(() => {
            this.close();
        }, 3000);
    }
}

/**
 * Controller General (Dependency Inversion Principle)
 * Integra las dependencias para desacoplar la vista de la fuente de datos.
 */
class AppController {
    constructor(repository, renderer, modalHandler) {
        this.repository = repository;
        this.renderer = renderer;
        this.modalHandler = modalHandler;

        this.allDogs = [];
        this.sexFilter = document.getElementById("sex-filter");
        this.ageFilter = document.getElementById("age-filter");
    }

    async init() {
        this.allDogs = await this.repository.getDogs();
        this.renderCatalog();
        this.setupEventListeners();
    }

    renderCatalog() {
        const criteria = {
            sexo: this.sexFilter.value,
            edad: this.ageFilter.value
        };

        const filteredDogs = DogFilterService.filter(this.allDogs, criteria);
        this.renderer.render(filteredDogs, (dog) => this.modalHandler.open(dog));
    }

    setupEventListeners() {
        this.sexFilter.addEventListener("change", () => this.renderCatalog());
        this.ageFilter.addEventListener("change", () => this.renderCatalog());
    }
}

// Inicialización respetando Inyección de Dependencias
document.addEventListener("DOMContentLoaded", () => {
    const repository = new DogRepository();
    const renderer = new DogCardRenderer("dog-grid");
    const modalHandler = new AdoptionModalHandler();

    const app = new AppController(repository, renderer, modalHandler);
    app.init();
});