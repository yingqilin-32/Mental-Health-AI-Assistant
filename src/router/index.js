import{} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import BackendLayout from '../components/BackendLayout.vue'
import FrontendLayout from '../components/FrontendLayout.vue'
import AuthLayout from '../components/AuthLayout.vue'


// Set up the routes for the application
const backendRoutes = [

    {   path: '/back',
        redirect: '/back/dashboard',
        component: BackendLayout,
        children: [

            { path: 'dashboard',
            component: () => import('@/views/Dashboard.vue'),
            meta:{
            title: 'Data Analytics Dashboard',
            icon: 'PieChart',
            } },

            {
            path:'knowledge',
            component: () => import('@/views/Knowledge.vue'),
            meta:{
                title: 'Knowledge Report',
                icon: 'ChatLineSquare',   
            } },

            {
                path:'consultation',
                component: () => import('@/views/Consultation.vue'),
                meta:{
                    title: 'Consultation record',
                    icon: 'Message',
                }
            },

            {
                path:'journal',
                component: () => import('@/views/Journal.vue'),
                meta:{
                    title: 'Journal',
                    icon: 'User',
                }
            }

        ]
    },
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                component: () => import('@/views/Login.vue'),
                meta: {
                    title: 'Login'
                }
            },
            {
                path: 'register',
                component: () => import('@/views/Register.vue'),
                meta: {
                    title: 'Register'
                }
            }
        ]
    }
]


const frontendRoutes = [
    {
        path: '/',
        component: FrontendLayout,
        children: [
            {
                path: '',
                component: () => import('@/views/Home.vue'),
                // meta: {
                //     title: 'Home'
                // }
            },
            {
                path:'consultation',
                component: () => import('@/views/ConsultationFrontend.vue'),
                // meta: {
                //     title: 'Consultation'
                // }
            },
            {
                path:'emotion-diary',
                component: () => import('@/views/EmotionDiary.vue'),
                // meta: {
                //     title: 'Journal'
                // }    
            },
            {
                path:"knowledge",
                component: () => import('@/views/KnowledgeFrontend.vue'),
                // meta: {
                //     title: 'Knowledge'
                // }
            }
        ]
    },
]

// Two moods of exporting the router, one for development and one for production
const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...backendRoutes,
        ...frontendRoutes
    ]
})

// router.beforeEach
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    // login user or not
    if(token){
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        // backend page or not
        if(userInfo?.userType ==2){
            if(to.path.startsWith('/back')){
                next();
            }else{
                next('/back/dashboard');
            }
        }else if (userInfo?.userType ==1) {
            if(to.path.startsWith('/back')||to.path.startsWith('/auth')){
                next('/');
            }else{
                next();
            }
        }else{
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            next('/auth/login');
        }

    }else{
        if(to.path.startsWith('/back')){
            next('/auth/login');
        }else{
            next();
        }
    }


})

export default router
