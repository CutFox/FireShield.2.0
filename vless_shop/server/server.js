import express from 'express';

const app = express();

app.get("/", async (req, res) => {
  res.send("add");
});

app.post("/post", async (req, res) => {
  res.send("add post endpoint");
});

app.get('/redirect_app', async (req, res) => {
    try {
        const { target } = req.query;
        if (!target) {
            return res.status(404);
        }
        let targetUrl;
        try {
            
            if (target.startsWith('happ')) {
              targetUrl = new URL(target);  
            }

        } catch {
            console.log('Invalid URL format');
        }
        res.redirect(target);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.get('/redirect', (req, res) => {
    res.redirect(`happ://crypt4/wHjraNeLxL5pabHzutJK7WQfuTL8DJtbRqwLk0eN9k/ZsGc4rEYadbx9bHy0pfL7rqHMKYhd0ixPj+hjUHjcu7V1uLXSkVhM1KHWTkUcCs6qcLF6HFvSE7o2qqE+edQ/3V9oyryLKQTJIF38k3cBfioMuGpV2lZb0MUa4OWmllmbSZlq558CnzcBA9tFHBW4SkslOdD3iqNE1n5stutAr9HRvKrr7oIE69CoVjlZHQUKeP9KY9vIQOEmZv1QSypBj+ihIva7gJ7I0AavKzlU+iT7HDXknmkQat/bpIgJLAoVTnrnoOrMK2CCH11h7zeFQW08XRndiOj1qi6lF5wcQuaUYL/seTH0N5VTJHvRQzAKYWgEhcK+P/JhgOgJDXN6W5n2U7IJ9PdzQ7B4Su78M44hTWBvNHJI3782oQvmeSW/G2Ol/UiGRbfjuRVr0vn/w7dYVLbo3iSGuKyEXN4eaGJS44jo90zkqc7Lh174RwBCNPJjt+ml/ijWl/bV2XlsBBWv5pFPRf3NAtGDPtRi3Q1aB26xlQC9tRRA/5MXPTJTPvevUx6rXPGtvNFaxKrA2vilr4I7z3ZjYTXFUXJut9IFRoaY3BnX54KHcG6lRdXCSA+6Pxqus6G1TyP9oUdNjr/KhfG+XX605sXS6dGf0bf4Z/Ct7vtmPYL8Ps2vxBo=`);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});