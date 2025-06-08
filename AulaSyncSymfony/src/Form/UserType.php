<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Formulario base para usuarios.
 * Puede ser extendido o reutilizado para diferentes tipos de usuario.
 */
class UserType extends AbstractType
{
    /**
     * Construye el formulario de usuario.
     *
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // ...definición del formulario...
    }
}
