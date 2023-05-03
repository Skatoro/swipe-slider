"use strict"

function Gallery(args) {
    this.init(args);
}

Gallery.prototype = {
    options: {
        selector: '.gallery-container',
        nextSelector: '.btn-next',
        prevSelector: '.btn-prev',
        startSelector: '.btn-start',
        stopSelector: '.btn-stop',
        photoContainerSelector: '.photo-container',
        photoWrapperSelector: '.photo-wrapper',
        buttonContainerSelector: '.button-container',
        pagerContainerSelector: '.pager-container',
        perView: 1,
        transitionTimeMS: 300,
        firstActive: 0,
        timeout: 1000,
        showPager: false,
        initRun: false,
    },
    init: function(args) {
        this.options = Object.assign(this.options, args);
        const _self = this;
        this.isStopped = !this.options.initRun;
        this.buttonCoolDown = false;
        this.transitionTime = (this.options.transitionTimeMS / 1000).toString() + 's';

        this.holder = this.options.node;
        this.photoContainer = this.holder.querySelector(this.options.photoContainerSelector);
        this.photoWrapper = this.holder.querySelector(this.options.photoWrapperSelector);

        this.images = this.holder.querySelectorAll(`${this.options.photoWrapperSelector} > *`);
        this.imagesAmount = this.images.length;

        this.currentActive = this.options.firstActive + this.imagesAmount;
        this.photoWidth = (this.photoWrapper.querySelector(":first-child").offsetWidth + 20); // 20 = margin-right
        this.photoWrapper.style.left = `-${this.currentActive * (this.photoWidth)}px`;
        this.photoWrapper.style.transition = this.transitionTime;

        const elWidth = this.photoWrapper.querySelector(":first-child").offsetWidth;
        this.photoContainer.style.width = `${elWidth * this.options.perView + 20 * (this.options.perView - 1)}px`; // 20 = margin-right


        let isDragStart = false;
        let prevPageX;
        let prevScrollLeft;
        let curpagex;
        this.photoContainer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.isDragStart = true;

            prevPageX = e.pageX;
            curpagex     = e.pageX;
            prevScrollLeft = this.photoContainer.scrollLeft;
        })
        this.photoContainer.addEventListener("mousemove", (e) => {
            if (!this.isDragStart) return;

            let positionDiff = e.pageX - curpagex;
            curpagex = e.pageX;
            let curContainerLeft = this.photoWrapper.style.left.slice(0, -2)
            console.log(curContainerLeft, positionDiff)
            console.log(typeof curContainerLeft, typeof positionDiff)
            this.photoWrapper.style.left = `${Number(curContainerLeft) + positionDiff}px`;


        })
        this.photoContainer.addEventListener("mouseup", (e) => {
            this.isDragStart = false;
        })

        this.nextButton = this.holder.querySelector(this.options.nextSelector);
        this.nextButton.addEventListener("click", () => _self.changeSlide("next"));
        this.prevButton = this.holder.querySelector(this.options.prevSelector);
        this.prevButton.addEventListener("click", () => _self.changeSlide("prev"));

        this.startButton = this.holder.querySelector(this.options.startSelector);
        this.startButton.addEventListener("click", () => _self.startSlide());
        this.stopButton = this.holder.querySelector(this.options.stopSelector);
        this.stopButton.addEventListener("click", () => _self.stopSlide());

        if (this.options.showPager) {
            this.addPager();
            this.pagers = this.holder.querySelectorAll(`${this.options.pagerContainerSelector} > *`);
            this.setPagerListener();
        }

        this.createDuplicates();

        if (this.options.initRun) {
            this.run();
        }
    },
    addPager: function () {
        for (let i = this.imagesAmount; i < this.imagesAmount * 2; i++) {
            const parent = this.holder.querySelector(".pager-container");
            const child = document.createElement("div");
            child.classList.add("pager-unit");
            child.dataset.number = `${i - this.imagesAmount}`;
            parent.appendChild(child);
            if (i === this.currentActive) {
                child.classList.add("pager-active");
            }
        }
    },
    setPagerListener: function () {
        const _self = this;
        for (let i = 0; i < this.imagesAmount; i++) {
            let currentPagerUnit = this.pagers[i];
            currentPagerUnit.onclick = function() {
                _self.changeSlide(Number(currentPagerUnit.dataset.number) + _self.imagesAmount)
            };
        }
    },
    createDuplicates: function () {
        let imagesCopy = [];

        for (let i = 0; i < this.imagesAmount; i++) {
            imagesCopy.push(this.images[i].cloneNode(true));
            imagesCopy[i].classList.remove("shoes-wrapper");
            imagesCopy[i].classList.add("shoes-wrapper-duplicate");
        }
        for (let i = this.imagesAmount - 1; i >= 0; i--){
            this.photoWrapper.insertAdjacentHTML('afterbegin', imagesCopy[i].outerHTML);
        }
        for (let i = 0; i < this.imagesAmount; i++){
            this.photoWrapper.insertAdjacentHTML('beforeend', imagesCopy[i].outerHTML);
        }
    },
    dragging: function (e) {
        if (!this.isDragStart) return;
        e.preventDefault();
        this.photoWrapper = e.pageX;
    },
    changeSlide: function (pointer) {
        if (!this.buttonCoolDown) {
            this.clearInterval();
            const _self = this;
            let currPager;
            this.photoWrapper.style.transition = this.transitionTime;

            removePagerActive();

            if (pointer === "next") {
                if (this.currentActive === this.imagesAmount * 2 - 1) {
                    this.currentActive++;
                    this.photoWrapper.style.left = `-${(this.currentActive) * (this.photoWidth)}px`;
                    this.currentActive = this.imagesAmount;

                    addPagerActive()
                    setCoolDown("change");
                } else {
                    this.currentActive++;
                    this.photoWrapper.style.left = `-${(this.currentActive) * (this.photoWidth)}px`;

                    addPagerActive();
                    setCoolDown("plain");
                }
            }
            else if (pointer === "prev") {
                if (this.currentActive === this.imagesAmount) {
                    this.currentActive--;
                    this.photoWrapper.style.left = `-${(this.currentActive) * (this.photoWidth)}px`;
                    this.currentActive = this.imagesAmount * 2 - 1;

                    addPagerActive();
                    setCoolDown("change");
                } else {
                    this.currentActive--;
                    this.photoWrapper.style.left = `-${(this.currentActive) * (this.photoWidth)}px`;

                    addPagerActive()
                    setCoolDown("plain");
                }
            } else if (!isNaN(pointer)) {
                this.currentActive = pointer;
                this.photoWrapper.style.left = `-${(this.currentActive) * (this.photoWidth)}px`;

                addPagerActive()
                setCoolDown("plain");
            }
            this.buttonCoolDown = true;
            if (!this.isStopped) {
                this.interval = setInterval(() => this.run(), this.options.timeout);
            }

            function setCoolDown(mode) {
                if (mode === "plain") {
                    setTimeout(() => {
                        _self.buttonCoolDown = false;
                    }, _self.options.transitionTimeMS)
                } else if (mode === "change") {
                    setTimeout(() => {
                        _self.photoWrapper.style.transition = `0s`;
                        _self.photoWrapper.style.left = `-${(_self.currentActive) * (_self.photoWidth)}px`;
                        _self.buttonCoolDown = false;
                    }, _self.options.transitionTimeMS);
                }
            }
            function removePagerActive() {
                if (_self.options.showPager){
                    currPager = _self.pagers[_self.currentActive - _self.imagesAmount];
                    currPager.classList.remove("pager-active");
                }
            }
            function addPagerActive() {
                if (_self.options.showPager){
                    currPager = _self.pagers[_self.currentActive - _self.imagesAmount];
                    currPager.classList.add("pager-active");
                }
            }
        }

    },
    startSlide: function() {
        this.run();
        this.isStopped = false;
    },
    stopSlide: function() {
        this.clearInterval();
        this.isStopped = true;
    },
    run: function() {
        this.clearInterval();
        this.interval = setInterval(() => {
            this.changeSlide("next");
        }, this.options.timeout);
    },

    clearInterval: function() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
};

function createGalleries() {
    let nodes = document.querySelectorAll('.gallery-container');
    let galleries = [];
    let counter = 0;

    nodes.forEach(node => {
        if (counter === 0 ) {
            let tempGal = new Gallery({
                node: node,
                showPager: true,
                initRun: true,
            })
            galleries.push(tempGal);
        } else if (counter === 1){
            let tempGal = new Gallery({
                node: node,
                showPager: true,
                initRun: true,
                perView: 3,
            })
            galleries.push(tempGal);
        }
        counter++;
    })
}

window.addEventListener('DOMContentLoaded', () => {
    createGalleries();
});