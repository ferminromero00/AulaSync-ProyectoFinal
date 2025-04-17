<?php

namespace App\Form;

use App\Entity\Alumno;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AlumnoRegistroType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('email', EmailType::class)
            ->add('first_name', TextType::class)
            ->add('last_name', TextType::class)
            ->add('plainPassword', PasswordType::class, [
                'mapped' => false,
                'label' => 'Contraseña'
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Alumno::class,
            'csrf_protection' => false,
        ]);
    }
}
