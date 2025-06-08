<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Formulario para la entrega de tareas por parte del alumno.
 * Permite adjuntar archivos y comentarios.
 */
class TareaEntregaType extends AbstractType
{
    /**
     * Construye el formulario de entrega de tarea.
     *
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // ...definición del formulario...
    }
}
