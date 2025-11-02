module.exports = [
    {
        id: 1,
        text: "¿Qué palabra clave se utiliza para definir una clase en C++?",
        options: ["struct", "class", "type", "def"],
        correct: "class" 
    },
    {
        id: 2,
        text: "¿Cuál es el propósito principal de la biblioteca iostream?",
        options: ["Manipulación de archivos", "Entrada y salida de datos a través de la consola", "Operaciones matemáticas complejas", "Gestión de memoria dinámica"],
        correct: "Entrada y salida de datos a través de la consola"
    },
    {
        id: 3,
        text: "¿Cómo se declara un puntero a un entero llamado 'ptr'?",
        options: ["int* ptr;", "int ptr;", "*int ptr;", "pointer<int> ptr;"],
        correct: "int* ptr;"
    },
    {
        id: 4,
        text: "¿Qué operador se utiliza para la sobrecarga de operadores en una clase?",
        options: ["::", "->", "op", "operator"],
        correct: "operator"
    },
    {
        id: 5,
        text: "¿Qué significa el término 'polimorfismo' en el contexto de C++?",
        options: ["La habilidad de una función de tener múltiples cuerpos", "La capacidad de un objeto de tomar muchas formas", "Ocultar la implementación de los detalles", "Asignación de memoria en tiempo de ejecución"],
        correct: "La capacidad de un objeto de tomar muchas formas"
    },
    {
        id: 6,
        text: "¿Cuál de las siguientes es una forma de asignar memoria dinámicamente en C++?",
        options: ["alloc", "malloc()", "new", "create"],
        correct: "new"
    },
    {
        id: 7,
        text: "¿Qué hace la palabra clave 'const' aplicada a un método de clase?",
        options: ["Asegura que el método se ejecute más rápido", "Impide que el método modifique los miembros de datos de la clase", "Convierte el método en una función estática", "Permite que el método sea llamado solo por objetos constantes"],
        correct: "Impide que el método modifique los miembros de datos de la clase"
    },
    {
        id: 8,
        text: "¿Cuál es la forma correcta de incluir un archivo de cabecera estándar?",
        options: ["#include 'nombre.h'", "#include <nombre>", "import 'nombre';", "using nombre;"],
        correct: "#include <nombre>"
    },
    {
        id: 9,
        text: "¿Qué estructura de datos del STL proporciona acceso rápido a elementos por clave?",
        options: ["std::vector", "std::list", "std::map", "std::queue"],
        correct: "std::map"
    },
    {
        id: 10,
        text: "¿Qué concepto permite a una clase heredar propiedades de otra clase?",
        options: ["Encapsulamiento", "Abstracción", "Herencia", "Polimorfismo"],
        correct: "Herencia"
    },
    {
        id: 11,
        text: "¿Cuál es la función del destructor de una clase?",
        options: ["Inicializar los miembros de datos", "Liberar los recursos antes de que el objeto sea destruido", "Crear una nueva instancia del objeto", "Realizar copias de objetos"],
        correct: "Liberar los recursos antes de que el objeto sea destruido"
    },
    {
        id: 12,
        text: "¿Qué operador se utiliza para desreferenciar un puntero (acceder al valor apuntado)?",
        options: ["&", ".", "*", "->"],
        correct: "*"
    },
    {
        id: 13,
        text: "¿Cuál es el tipo de dato que se utiliza para devolver un valor de una función que no devuelve nada?",
        options: ["null", "void", "none", "int"],
        correct: "void"
    },
    {
        id: 14,
        text: "¿Cómo se conoce a la capacidad de una función o método para actuar sobre diferentes tipos de datos?",
        options: ["Plantillas (Templates)", "Herencia", "Composición", "Delegación"],
        correct: "Plantillas (Templates)"
    },
    {
        id: 15,
        text: "¿Cuál es el operador de ámbito (scope resolution operator) en C++?",
        options: [".", "->", "::", ":"],
        correct: "::"
    },
    {
        id: 16,
        text: "¿Qué ocurre si no liberas la memoria asignada con 'new'?",
        options: ["El programa falla inmediatamente", "La memoria se libera automáticamente al salir del bloque", "Ocurre una 'fuga de memoria' (memory leak)", "El compilador genera una advertencia"],
        correct: "Ocurre una 'fuga de memoria' (memory leak)"
    }
];