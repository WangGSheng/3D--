<template>
    <div class="ui flex column item one col-center row-center">
        <iframe src="./static/404.html" width="100%" height="100%" frameborder="0"></iframe>
        <div style="position: absolute; bottom:15%; left:50%; margin-left:-200px">
            <router-link :to="{ path: 'home' }" class="huge ui blue basic button" style="width: 400px;">返回首页</router-link>
        </div>
    </div>
</template>
