document.addEventListener('DOMContentLoaded', function(){
  //  CATEGORY GROUPS 
  const treeCategories = document.querySelectorAll('.tree-category');
  const plantCategories = document.querySelectorAll('.plant-category');
  const equipmentCategories = document.querySelectorAll('.equipment-category');
  const mainCategories = document.querySelectorAll('.main-category-select');

  //  CATEGORY BUTTONS 
  const showTreeCategory = document.getElementById('show-tree-category'); 
  const showPlantCategory = document.getElementById('show-plant-category'); 
  const showEquipmentCategory = document.getElementById('show-equipment-category'); 
  const closeButton = document.getElementById('close-category');
  const galleryLink = document.getElementById('category-gallery')

  // INITIAL STATE
  hideAllSubcategories();
  closeButton.style.display = 'none';
  galleryLink.style.display = 'none'

 
  showTreeCategory.addEventListener('click', () => showCategory(treeCategories));
  showPlantCategory.addEventListener('click', () => showCategory(plantCategories));
  showEquipmentCategory.addEventListener('click', () => showCategory(equipmentCategories));
  closeButton.addEventListener('click', mainCategoryDefault);

  // FUNCTIONS 

  function hideAllSubcategories() {
    treeCategories.forEach(el => el.style.display = 'none');
    plantCategories.forEach(el => el.style.display = 'none');
    equipmentCategories.forEach(el => el.style.display = 'none');
  }

  function showCategory(categoryGroup) {

    // Hide all subcategories when category selected
    hideAllSubcategories();

    // Show the selected category
    categoryGroup.forEach(el => el.style.display = 'block');
    closeButton.style.display = 'inline-block';
    galleryLink.style.display = 'inline-block'
   
  }

  // default for back button
  function mainCategoryDefault() {
    hideAllSubcategories();

    // Show main categories
    mainCategories.forEach(el => el.style.display = 'block');
    closeButton.style.display = 'none';
    galleryLink.style.display = 'none'
  }
 
  
  const specialCard = document.getElementById("special-card")

  const specialHeader = document.createElement("div");
  specialHeader.id = "special-header"
  specialHeader.innerHTML = "New Fabric Comming Soon!"

  


  const picker = document.querySelector('.fabric-picker');
  const fabrics = document.querySelectorAll('.fabric');
  
  const containerWidth = picker.clientWidth;
  const revealFraction = 0.15;
  const visibleSlice = containerWidth * revealFraction;
  
  let activeIndex = null;
  
  // initial stack layout
  function layoutStack() {
    fabrics.forEach((fabric, index) => {
      fabric.style.right = `${index * visibleSlice}px`;
      fabric.style.zIndex = index;
      fabric.classList.remove('active');
    });
  }
  
  function activate(index) {
    activeIndex = index;
  
    fabrics.forEach((fabric, i) => {
      if (i === index) {
        fabric.style.right = '0px';
        fabric.style.zIndex = 100;
        fabric.classList.add('active');
      } else {
        fabric.style.right = `${(i + 1) * visibleSlice}px`;
        fabric.style.zIndex = i;
        fabric.classList.remove('active');
      }
    });
  }
  
  layoutStack();
  
  fabrics.forEach((fabric, index) => {
    fabric.addEventListener('click', () => {
  
      // toggle behavior
      if (activeIndex === index) {
        activeIndex = null;
        layoutStack();
        return;
      }
  
      activate(index);
  
    });
  });
  
  
  });
  
  
  