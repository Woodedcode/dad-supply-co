import DadSupplyTee from "../assets/dad-supply-tee.png";
import DadSupplyHat from "../assets/dad-supply-hat.png";
import ImpastaFront from "../assets/impasta-front.png";
import ImpastaBack from "../assets/impasta-back.png";

const products = [
    {
        id:1,
        name: "Dad Supply Tee",
        price: "$28.00",
        image: DadSupplyTee,
        type:"shirt",
        sizes: ["S", "M", "L", "XL", "2XL"]
    },
    {
        id:2,
        name: "Dad Supply Hat",
        price: "$25.00",
        image: DadSupplyHat,
        type: "hat",
        sizes: ["One Size"]
    },
    {
        id: 3,
        name: "Im-pasta Tee",
        price: "$28.00",
        image:ImpastaFront,
        backImage: ImpastaBack,
        type: "shirt",
        sizes: ["S", "M", "L", "XL", "2XL"],
},
]

export default products;