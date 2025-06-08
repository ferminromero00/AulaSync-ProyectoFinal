<?php

namespace App\Form;

use App\Entity\Profesor;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Formulario para la configuración del perfil del profesor.
 * Permite editar nombre, apellidos, email, especialidad y departamento.
 */
class ConfiguracionProfesorType extends AbstractType
{
    /**
     * Construye el formulario de configuración de profesor.
     *
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('firstName', TextType::class)
            ->add('lastName', TextType::class)
            ->add('email', EmailType::class)
            ->add('especialidad', TextType::class)
            ->add('departamento', TextType::class)
        ;
    }

    /**
     * Configura las opciones del formulario.
     *
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Profesor::class,
            'csrf_protection' => false
        ]);
    }
}
