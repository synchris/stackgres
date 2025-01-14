import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.config.productionTip = false

Vue.use(VueMarkdown);

const vm = new Vue({
  router,
  store,
  render: h => h(App),
  data: {
    active: true,
    ip: '',
    currentCluster: '',
    currentPods: '',
    clustersData: {},
    init: false
    //clusters: []
  },
  methods: {
    

  },
  mounted: function() {

  },

  computed: {

  }
}).$mount('#app')

var apiData = []

var urlParams = new URLSearchParams(window.location.search);

// Check URL Params
if( urlParams.has('darkmode') || (getCookie('sgTheme') === 'dark') ) {
  console.log('Switching to darkmode');
  store.commit('setTheme', 'dark');
  $('body').addClass('darkmode');
  $('#darkmode').addClass('active');
}

// Check timezone preferences
if( getCookie('sgTimezone') === 'utc') {
  console.log('Switching to UTC timezone');
  store.commit('toggleTimezone');
}

Vue.filter('prettyCRON', function (value) {
  return prettyCron.toString(value)
  
});

Vue.filter('formatBytes',function(a){

  // Bytes Formatter via https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  if(0==a)return"0 Bytes";var c=1024,d=2,e=["Bytes","Ki","Mi","Gi","Ti","Pi","Ei","Zi","Yi"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f];

});

Vue.filter('prefix',function(s, l = 2){
  return s.substring(0, l);
});


Vue.filter('formatTimestamp',function(t, part, tzCheck = true){

  // Adjust timestamp according to user timezone
  if(!!moment().utcOffset() && tzCheck && (store.state.timezone == 'local') ) {
    t = moment.utc(t).local().format('YYYY-MM-DDTHH:mm:ss.SSS')
  }

  if(part == 'date')
    return t.substr(0, 10);
  else if (part == 'time')
    return t.substring( 11, 19);
  else if (part == 'ms') {

    if(t.includes('.')) {
      var ms = '.' + t.split('.')[1];

      for(var i = ms.length; i <= 3; i++) {
        ms += '0'
      }
      return (store.state.timezone == 'local') ? ms.substring(0,4) : (ms.substring(0,4) + ' Z');
    } else {
      return (store.state.timezone == 'local') ? '.000' : '.000 Z';
    }
  }
      
});

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function arraysMatch (arr1, arr2) {

  // Check if the arrays are the same length
  if (arr1.length !== arr2.length) return false;

  // Check if all items exist and are in the same order
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  // Otherwise, return true
  return true;

}

function checkData (newData, currentData) {
  return (JSON.stringify(newData) != JSON.stringify(currentData))
}

function trimString(string) {
  return string.trim();
}

function getJSON( value ) {
  //e.preventDefault();
  var text = value.split("\n").map(trimString);
  var json = {};

  text.forEach(function(e, i, a){
    var param = e.split("=").map(trimString);
    json[''+param[0].toString()+''] = param[1];
  });

  // alert(json);
  // console.log(json);
  
  return(json);
}

function showFields( fields ) {
  $(fields).slideDown();
}

function hideFields( fields ) {
  $(fields).slideUp();
}

function discoverText(e) {
  var search = $("#keyword").val();
  console.log(search);

  if (/[a-zA-Z]/.test(search) || e.keyCode == "8" || e.keyCode == "46") {
      
      $("table tr").each(function () {

          if ( ($(this).text().toLowerCase().indexOf(search.toLowerCase()) !== -1) )
              $(this).fadeIn();
          else
              $(this).fadeOut();

      });
  }
}

/* jQuery Init */

$(document).ready(function(){

  $("#namespaces li:first-of-type a").click();

  $(document).on("click", "a.namespace", function(){
    store.commit('setCurrentNamespace',$(this).text());
    $("#backup-btn, #graffana-btn").css("display","none");
  });

  $(document).on("click", ".box h4", function() {
    
    $(this).parents(".box").toggleClass("show");

    // Look for toggle button
    var btn = $(this).parents(".table").find(".details .btn");
    
    if(btn.length) {
      if(btn.text() == 'Details')
        btn.text(' Close ');
      else
        btn.text('Details');  
    }
  
  });

  $(document).on("click", ".details .btn", function(){

    $(this).parents(".box").toggleClass("show");

    if($(this).text() == 'Details')
      $(this).text(' Close ');
    else
      $(this).text('Details');
  
  });

  $(document).on("click", "#main, #side", function(e) {

    if($(this).prop("id") != "notifications") {
      $("#notifications.hasTooltip.active").removeClass("active");
      $("#notifications.hasTooltip .message.show").removeClass("show");
      $("#selected--zg-ul-select.open").removeClass("open");
      $("#be-select.active").removeClass("active");
    }

    if (!$(e.target).parents().addBack().is('.cloneCRD') && $('#clone').hasClass('show'))
      $('#clone.show').fadeOut().removeClass('show');

  });
  
  $("#clone").click(function(e){
    e.stopPropagation();
  });


  $(document).on("click", "#sets .nav-item", function(){
   /*  if(!$(this).parents().hasClass("clu"))
        $('.clu.active').removeClass('active');
    
    if(!($(this).parent().hasClass("active"))) {
      $(".set.active:not(.conf)").removeClass("active");
      $(this).parent("div:not(.conf)").addClass("active");
    } */
    $("#current-namespace").removeClass('open');
    $('#ns-select').slideUp();

    $(".set:not(.active) > ul.show").removeClass("show");
    
  });

  $(document).on("click", ".set .item", function(){    
    $(".set:not(.active) > ul.show").removeClass("show");
  });

  $(document).on("mouseover", ".set:not(.active)", function(){
    let offset = $(this).offset();
    let submenu = $(this).children("ul");
    
    if(window.innerHeight > 700)
      submenu.css("bottom","auto").css("top",offset.top - window.scrollY)
    else
      submenu.css("top", "auto").css("bottom",window.innerHeight - $(this).height() - offset.top)
      
    submenu.addClass("show");
  });

  $(document).on("mouseleave", ".set:not(.active) ul.show", function(){
    $(this).removeClass("show");
  });

  $(document).on("mouseleave", ".set:not(.active)", function(){
    $(this).children("ul.show").removeClass("show");
  });

  $(document).on("click", "#nav:not(.disabled) .top a.nav-item", function(){
    $(".clu a[href$='"+store.state.currentCluster+"']").addClass("router-link-active");
  });

  $(".expand").click(function(){
    $(".set").addClass("active");
    $("#sets").addClass("expanded");
  });

  $(".collapse").click(function(){
    $(".set").removeClass("active");
    $("#sets").removeClass("expanded");
  });

  $("#nav .view").click(function(){
    $("#nav .tooltip.show").prop("class","tooltip").hide();
    $("#nav .top a.nav-item").removeClass("router-link-active");
  });

  $("#nav.disabled .top a.nav-item").click(function(){
      $("#nav .tooltip.show").prop("class","tooltip").hide();
      $(this).siblings(".tooltip").fadeIn().addClass("show");
      $("#nav .top .tooltip").addClass("pos"+($(this).index()+1));
  });

  $(".hasTooltip > a").click(function(){
    if($(this).parent().hasClass("active")) {
      $(this).parent().removeClass("active");
      $(this).parent().find("div.message").removeClass("show");
    }
    else{
      $(".hasTooltip.active").removeClass("show");
      $(this).parent().addClass("active");
      $(this).parent().find("div.message").addClass("show");
    }      
  });

  /* Disable Grafana KEY functions */
  $(".grafana iframe").contents().find("body").keyup( function(e) {
    switch (e.keyCode) {
      case 27: // 'Esc'
        event.returnValue = false;
        event.keyCode = 0;
        alert("ESC");
        break;
    }
  });


  $.fn.ulSelect = function(){
    var ul = $(this);

    if (!ul.hasClass('zg-ul-select'))
      ul.addClass('zg-ul-select');
    
    $('li:first-of-type', this).addClass('active');

    var selected = $('#selected--zg-ul-select');
      
    
    $(document).on('click', '#selected--zg-ul-select', function(){

      $(this).toggleClass('open');
      ul.toggleClass('active');

      var selectedText = $(this).text();
      if (ul.hasClass('active')) {
        selected.addClass('active');
      }
      else {
        //selected.text('').removeClass('active'); 
        $('li.active', ul);
      }
    });

    $(document).on('click', '#be-select li a', function(){
      selected.removeClass('open');
      ul.removeClass('active');
      $(".set.backups.active").removeClass('active');
    });

  }

  // Run
  $('#be-select').ulSelect();

  // Uncheck checkboxes by default
  //$('.switch input[type="checkbox"]').removeAttr('checked');

  $(document).on('click', '.message .remove', function(){
    $(this).parent().detach();
   
    $("#notifications .count").text(parseInt($("#notifications .count").text(),10)-1);
    
    if(parseInt($("#notifications .count").text(),10) == 0)
      $("#notifications .tooltip .zero").show();
  });

  $("form").submit(function(e){
    e.preventDefault(); 
  });

  $(document).on("click", ".sort th span:not(.helpTooltip)", function(){
    $(".sorted").removeClass("sorted");
    $(this).addClass("sorted");
    $(".sort th").toggleClass("desc asc")   
  });

  $(document).mouseup(function(e) {
    var container = $(".filter.open");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      if( $('.filter.open').find('.active').length )
        $('.filter.open').addClass('filtered');
      else
        $('.filter.open').removeClass('filtered');
      
        $('.filter.open').removeClass("open");
    }
  });
 
  $(document).on("click",".toggle:not(.date)",function(e){
    e.stopPropagation();
    $(this).parent().toggleClass("open");
    //$(this).next().toggleClass("open");
  })

  $(document).on("click", "#current-namespace , #ns-select a", function(){
    $("#current-namespace").toggleClass("open");
    $("#ns-select").slideToggle();
    $(".set.active:not(.conf)").removeClass('active');
  });

  $("#darkmode").click(function(){
    $("body").toggleClass("darkmode");
    $(this).toggleClass("active");

    if($("body").hasClass("darkmode")) {
      store.commit('setTheme', 'dark');
      
      if($('#grafana').length)
        $('#grafana').attr("src", $('#grafana').attr("src").replace('light','dark'));
    }
    else {
      store.commit('setTheme', 'light');

      if($('#grafana').length)
        $('#grafana').attr("src", $('#grafana').attr("src").replace('dark','light'));
    }

    
  });

  $(document).on("click","[data-active]", function(){
    $($(this).data("active")).addClass("active");
  });

  $(document).on("click",".openConfig", function(){
    $(this).toggleClass('open');
    $(this).parents('tr').toggleClass('open');
    $(this).parents('tr').find('.parameters').toggleClass('open');
  });

  $(document).on('click', 'ul.select .selected', function(){
    $(this).parent().toggleClass('active');
  });

  $(document).on('click', '.set > .addnew', function(){
    if(!$(this).parent().hasClass('active')) {
      $('.set.active:not(.conf)').removeClass('active');
      $('.set ul.show').removeClass('show');
      $(this).parent().addClass('active');
    }
  });

  $('form.noSubmit').on('submit',function(e){
    e.preventDefault
  });

  onmousemove = function (e) {

    if( (window.innerWidth - e.clientX) > 420 ) {
      $('#nameTooltip, #infoTooltip').css({
        "top": e.clientY+20, 
        "right": "auto",
        "left": e.clientX+20
      })
    } else {
      $('#nameTooltip, #infoTooltip').css({
        "top": e.clientY+20, 
        "left": "auto",
        "right": window.innerWidth - e.clientX + 20
      })
    }
  }
  
  $(document).on('mouseenter', 'td.hasTooltip', function(){
    const c = $(this).children('span');
    if(c.width() > $(this).width()){
      $('#nameTooltip .info').text(c.text());
      $('#nameTooltip').addClass('show');
    }
      
  });

  $(document).on('mouseleave', 'td.hasTooltip', function(){ 
    $('#nameTooltip .info').text('');
    $('#nameTooltip').removeClass('show');
  });

  $(document).on('click','[data-tooltip]', function(e){
    if( (window.innerWidth - e.clientX) > 420 ) {
      $('#helpTooltip').css({
        "top": e.clientY+10, 
        "right": "auto",
        "left": e.clientX+10
      })
    } else {
      $('#helpTooltip').css({
        "top": e.clientY+10, 
        "left": "auto",
        "right": window.innerWidth - e.clientX + 10
      })
    }

    if(!$(this).hasClass('show')) {
      store.commit('setTooltipsText', $(this).data('tooltip'))
      $('.helpTooltip.show').removeClass('show')
      $('#helpTooltip').addClass('show').show()
    } else {
      store.commit('setTooltipsText','Click on a question mark to get help and tips about that field.')
      $('#helpTooltip').removeClass('show').hide()
    }

    $(this).toggleClass('show')  
  })

  $(document).on("click", "#helpTooltip a", function(e) {
    e.preventDefault()
    window.open($(this).prop('href'));
    return false;
  })

  $(document).on('click','a.help', function(){
    $('a.help.active').removeClass('active')
    $(this).addClass('active')
  })

  $('#contentTooltip .close').click(function(){
    $('#contentTooltip').removeClass('show');
    $('#contentTooltip .info .content').html('');
  })

  $(document).on("click", "#side", function(e) {

    if($('#contentTooltip').hasClass('show')) {
      $('#contentTooltip').removeClass('show')
      $('#contentTooltip .content').html('');
    }
  });

 /*  onmousemove = function (e) {

    if( (window.innerWidth - e.clientX) > 420 ) {
      $('#helpTooltip:not(.show)').css({
        "top": e.clientY+20, 
        "right": "auto",
        "left": e.clientX+20
      })
    } else {
      $('#helpTooltip:not(.show)').css({
        "top": e.clientY+20, 
        "left": "auto",
        "right": window.innerWidth - e.clientX + 20
      })
    }
  } */

  // Hide divs on click out
  $(document).click(function(event) { 
    var $target = $(event.target);
    
    if( $('.hideOnClick.show').length && !$target.closest('.show').length) {
      $('.hideOnClick.show').removeClass('show').fadeOut()
      $('.helpTooltip.show').removeClass('show')
    }
  });

  $(window).on('scroll', function(){
    $('#helpTooltip.show').removeClass('show').fadeOut()
    $('.helpTooltip.show').removeClass('show')
  })

  // Remove notValid class from changed fields
  $(document).on('change','[data-field].notValid', function(){
    $(this).removeClass('notValid')
  })

  $(document).on('click','.copyClipboard', function(){
    let el = $(this)
    let copyText = document.getElementById('copyText');
    copyText.value = el.parent().text();
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");
    setTimeout(function(){
      store.commit('setTooltipsText','Click on a question mark to get help and tips about that field.')
      $('#helpTooltip').removeClass('show').hide()
    },3000)
  })

});
