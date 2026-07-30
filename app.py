import pickle

with open("midhunesh.h5", "rb") as file:
    model = pickle.load(file)
    
hours = float(input("Enter study hours: "))

prediction = model.predict([[hours]])
print(f"Predicted Score: {prediction[0]:.2f}")