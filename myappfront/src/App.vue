<template>

  <div>

    <nav class="navbar navbar-expand-lg navbar-light bg-light">

      <div class="container-fluid">

        <a id="brand" class="navbar-brand" href="/">
          <img src="/assets/logo.png" alt="" width="30" height="26" class="d-inline-block align-top">
          Météo 77
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">

          <ul class="navbar-nav">

            <li class="nav-item"><router-link class="nav-link" to="/">Tableau de bord</router-link></li>

            <li class="nav-item"><router-link class="nav-link" to="/history">Historique</router-link></li>

            <li class="nav-item"><router-link class="nav-link" to="/compare">Comparatif</router-link></li>

            <li class="nav-item"><router-link class="nav-link" to="/map">Carte</router-link></li>
         
          </ul>
          
        </div>
        
      </div>
      
    </nav>
    
    <!-- Ou les vues vont s'insérer -->
    <router-view/>

  </div>

</template>

<style scoped>

  #brand{
    font-size: 30px;
    margin-right: 60px;
  }

  img{
    margin-top: 9px;
  }

  nav a.router-link-exact-active {
    color: #354fff !important;
  }

</style>