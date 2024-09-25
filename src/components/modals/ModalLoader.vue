<template>
    <BaseModal :isLoading="isLoading" name="loader" class="full-size"> </BaseModal>
</template>

<script>
import BaseModal from '@/components/modals/BaseModal.vue';

export default {
    data() {
        return {
            form: {},
            formDefault: {},
            isLoading: true
        };
    },
    components: {
        BaseModal
    }
};
</script>












